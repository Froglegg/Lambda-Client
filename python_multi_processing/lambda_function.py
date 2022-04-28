import json
import boto3
import time
import os

from pi_n_decimals_par import paralell_processor
from pi_n_decimals_seq import sequential_processor


def lambda_handler(event, context):

    message = event['Records'][0]
    message_body = message['body']
    message_attr = message['messageAttributes']

    n_decimals = 2
    n_chunks = 2

    use_multi_processing = True
    if 'n_decimals' in message_attr:
        n_decimals = int(message_attr['n_decimals']['stringValue'])
    if 'n_chunks' in message_attr:
        n_chunks = int(message_attr['n_chunks']['stringValue'])
    if 'use_multi_processing' in message_attr:
        mp_string_value = message_attr['use_multi_processing']['stringValue']
        use_multi_processing = True if mp_string_value == "True" else False

    print("Received message:")
    print(message_body)

    results = []

    print("\nBegin processing...\n")
    start_total = time.time()
    for i in range(n_decimals):
        if bool(use_multi_processing) == True:
            result = paralell_processor(i, n_chunks)
        else:
            result = sequential_processor(i)

        n, pi, elapsed = i, result[0], result[1]
        results_dict = {"n": n, "pi": pi, "elapsed_ms": round(elapsed * 1000)}
        results.append(results_dict)

    sqs = boto3.client('sqs')
    message = {
        'statusCode': 200,
        'body': results,
        'time_elapsed': round((time.time() - start_total) * 1000),
        "use_multi_processing": use_multi_processing
    }

    response = sqs.send_message(
        QueueUrl=os.environ['SUCCESS_QUEUE'],
        MessageBody=json.dumps(message)
    )

    print(response)

    return message

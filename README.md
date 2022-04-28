# SQS / Lambda Client
Node / React client for benchmarking paralell vs sequential processing in AWS Lambas. Uses SQS to send and poll messages, and web sockets for emitting results to frontend.

## Getting started
1. Zip `python_multi_processing` and deploy as Lambda function in AWS
2. Create SQS queues for sending messages / jobs and polling messages with completed jobs. Copy their URLs and add to shell environments .env file with the corresponding names: 
```
export TEST_LAMBDA_SQS_URL_SEND_MESSAGE=''
export TEST_LAMBDA_SQS_URL_POLL_MESSAGE=''
```
3. Make sure your AWS secret and access keys are also present in your shell environment.
4. Set the `SUCCESS_QUEUE` environemnt variable for the AWS Lambda function to the url of your success queue in the AWS Lambda console. 
5. Run `npm install` within the frontend and client 
6. cd into server and `npm run start`, and in a separate session, cd into frontend and run `npm run start`. 

## NOTE
Make sure you've set your RAM to 3008 GB in your Lambda function configuration, as AWS doesn't spin up new vCPU's until about 1.8 GB of memory is used.
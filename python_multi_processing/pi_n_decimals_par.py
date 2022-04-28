from multiprocessing import Process, Pipe
import time

# uses Leibniz infinite series for finding PI, computationally expensive :) 
# see https://en.wikipedia.org/wiki/Leibniz_formula_for_%CF%80

def get_pi_subrange(n, subrange, conn):
    pi_by_4 = 0
    for i in subrange:
        pi_by_4 += ((-1)**i)*(1/(2*i+1))*(10**(n+3))
    conn.send([int(pi_by_4 * 4)])
    conn.close()


def paralell_processor(n=2, n_chunks=2):
    max_denominator = 10**(n+3)
    max_iter = int((max_denominator-1)/2)

    ranges = []
    for i in range(n_chunks):
        r_i = range(int(i*max_iter/n_chunks), int((i+1)*max_iter/n_chunks))
        ranges.append(r_i)

    # create a list to keep all processes
    processes = []

    # create a list to keep connections
    parent_connections = []

    for subrange in ranges:  # This loop can be parallelized
        parent_conn, child_conn = Pipe()
        parent_connections.append(parent_conn)

        process = Process(target=get_pi_subrange, args=(n, subrange, child_conn,))
        processes.append(process)

    # start all processes
    for process in processes:
        start = time.time()
        process.start()

    # make sure that all processes have finished, join method will block until process resolves
    for process in processes:
        process.join()
        end = time.time()

    ans = 0

    for parent_connection in parent_connections:
        ans += parent_connection.recv()[0]
        
    elapsed = end-start
    
    return (int(ans/1000), elapsed)

import time

def sequential_processor(n):
    start = time.time()
    pi_by_4 = 0
    max_denominator = 10**(n+3)
    max_iter = int((max_denominator-1)/2)
    for i in range(max_iter):
        pi_by_4 += ((-1)**i)*(1/(2*i+1))*(10**(n+3))
    stop = time.time()
    elapsed = stop - start
    return (int(pi_by_4 * 4/1000), elapsed)
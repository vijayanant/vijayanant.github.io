---
title: "Performance Analysis In Python"
date: "2014-11-02 20:05:36"
slug: "performance-analysis-in-python"
tags: [ "python", "Profiling", "performance", "analysis" ]
categories: ["Programming"]
description: "A practical look at measuring Python performance. Learn how to use time, cProfile, and memory_profiler to identify bottlenecks and leaks in your code."
featured_image: "analysis.jpg"
draft: false
---


{{< note type="warning" title="A Note from the Author" >}}
This post is an artifact from my early days of learning Python, originally written back in 2014. While some of the information might be outdated, I'm preserving it here as a snapshot of my learning journey.

Back when I was first learning my way around Python, I set out to find out more about performance optimization. This post chronicles what I discovered during that initial exploration.
{{< /note >}}

## Performance Analysis

Let's start by defining what performance is and how to analyze it.

1. __Performance__ is a measure of _how fast_ the application (or each component of the application) is running and _how little memory_ it uses.

2. Performance __analysis__ is finding where the speed _bottlenecks_ are and where the _memory is leaking_.

{{< note type="info" >}}
In this article we will restrict ourselves to measuring and analysing the performance. Improving performance is a different topic altogether. Hopefully, I will have something to write about it someday.  Depending on the need of the hour, you can choose any one or a combination of the tools and techniques explained here.
{{< /note >}}

## Good old `time`

While I use a Mac, the `time` utility is a standard tool with Unix ancestry.

```shell
$ time python slowprogram.py
python slowprogram.py  3.81s user 0.04s system 97% cpu 3.927 total
```

The sum of user and system time gives you a measure of how much time your program took (excluding time taken for I/O).

However, this doesn't help much. While it tells you if the application is taking more time than expected, it doesn't point to where the bottleneck is.

## Python Timer Class - Context Manager

Corey Goldberg, in his blog [here][ref_goldberg], has given a tiny timer class that can be used to time any block of code.

```python
from timeit import default_timer
class Timer(object):
    def __init__(self, verbose=False):
        self.verbose = verbose
        self.timer = default_timer
        
    def __enter__(self):
        self.start = self.timer()
        return self
        
    def __exit__(self, *args):
        end = self.timer()
        self.elapsed_secs = end - self.start
        self.elapsed = self.elapsed_secs * 1000  # millisecs
        if self.verbose:
            print 'elapsed time: %f ms' % self.elapsed
```

With this class, you can time any block of code by enclosing it in a `with` block:

```python
from timer import Timer
from sorting import Sort
import random

random_items = [random.randint(-50, 100) for c in range(5000)]
sort = Sort()

with Timer() as t:
    sort.bubble_sort(random_items)
print "=> elapsed bubble_sort: %s s" % t.elapsed

with Timer() as t:
    sort.insertion_sort(random_items)
print "=> elapsed insertion_sort: %s s" % t.elapsed
```

Here is a sample output :

```shell
$ python UsingTimer.py
=> elapsed bubble_sort: 4177.52599716 s
=> elapsed insertion_sort: 1.23190879822 s
```

The advantage of this approach is that you can enclose any suspicious piece of code inside the `with` block to see if it's taking too long to complete. You can start with a large chunk of code and progressively narrow down the scope to pinpoint the problematic part.

## Profiling

A [profile][ref_profiling] is a set of statistics that describes how often and for how long various parts of the program get executed. The `time` utility described above is also a profiler - a simple one whose stats output is not very detailed.  

The Python standard library provides three different implementations of the same profiling interface. The documentation is available [here][ref_profilers].

### Simple approach

Simple way to profile a script is to invoke the cProfile when running a script:

```shell
python -m cProfile UsingTimer.py
```

This prints the stats onto standard out. A lot of information is dumped, but the most important columns are:

* `ncalls`: The number of times the function was called.
* `tottime`: The total time spent in the function, _excluding_ time spent in sub-functions.
* `percall`: The average time spent per call (`tottime` / `ncalls`).
* `cumtime`: The cumulative time spent in the function, _including_ time spent in sub-functions.
* `percall`: The average cumulative time spent per call (`cumtime` / `ncalls`).
* `filename:lineno(function)`: The file, line number, and name of the function.

```
=> elapsed bubble_sort: 4173.29096794 s
=> elapsed insertion_sort: 2.54702568054 s
         25073 function calls in 4.231 seconds

Ordered by: standard name

ncalls  tottime  percall  cumtime  percall filename:lineno(function)
    1    0.006    0.006    4.231    4.231 UsingTimer.py:1(<module>)
    1    0.000    0.000    0.000    0.000 __future__.py:48(<module>)
    1    0.000    0.000    0.000    0.000 __future__.py:74(_Feature)
    7    0.000    0.000    0.000    0.000 __future__.py:75(__init__)
    1    0.017    0.017    0.017    0.017 hashlib.py:55(<module>)
    6    0.000    0.000    0.000    0.000 hashlib.py:94(__get_openssl_constructor)
    1    0.002    0.002    0.002    0.002 heapq.py:31(<module>)
    1    0.000    0.000    0.001    0.001 random.py:100(seed)
 5000    0.011    0.000    0.011    0.000 random.py:175(randrange)
 5000    0.003    0.000    0.014    0.000 random.py:238(randint)
    1    0.008    0.008    0.026    0.026 random.py:40(<module>)
    1    0.000    0.000    0.000    0.000 random.py:655(WichmannHill)
    1    0.000    0.000    0.000    0.000 random.py:72(Random)
    1    0.000    0.000    0.000    0.000 random.py:805(SystemRandom)
    1    0.000    0.000    0.001    0.001 random.py:91(__init__)
    1    0.001    0.001    0.003    0.003 sorting.py:1(<module>)
    1    0.002    0.002    0.003    0.003 sorting.py:11(insertion_sort)
    1    0.000    0.000    0.000    0.000 sorting.py:3(Sort)
    1    4.084    4.084    4.173    4.173 sorting.py:4(bubble_sort)
    1    0.000    0.000    0.000    0.000 timeit.py:105(Timer)
    1    0.005    0.005    0.005    0.005 timeit.py:53(<module>)
    1    0.001    0.001    0.006    0.006 timer.py:1(<module>)
    2    0.000    0.000    0.000    0.000 timer.py:12(__exit__)
    1    0.000    0.000    0.000    0.000 timer.py:3(Timer)
    2    0.000    0.000    0.000    0.000 timer.py:4(__init__)
    2    0.000    0.000    0.000    0.000 timer.py:8(__enter__)
    1    0.000    0.000    0.000    0.000 {_hashlib.openssl_md5}
    1    0.000    0.000    0.000    0.000 {_hashlib.openssl_sha1}
    1    0.000    0.000    0.000    0.000 {_hashlib.openssl_sha224}
    1    0.000    0.000    0.000    0.000 {_hashlib.openssl_sha256}
    1    0.000    0.000    0.000    0.000 {_hashlib.openssl_sha384}
    1    0.000    0.000    0.000    0.000 {_hashlib.openssl_sha512}
    1    0.000    0.000    0.000    0.000 {binascii.hexlify}
    1    0.001    0.001    0.001    0.001 {function seed at 0x109498d70}
    6    0.000    0.000    0.000    0.000 {getattr}
    6    0.000    0.000    0.000    0.000 {globals}
 5002    0.001    0.000    0.001    0.000 {len}
    1    0.000    0.000    0.000    0.000 {math.exp}
    2    0.000    0.000    0.000    0.000 {math.log}
    1    0.000    0.000    0.000    0.000 {math.sqrt}
    1    0.000    0.000    0.000    0.000 {method 'disable' of '_lsprof.Profiler' objects}
 5000    0.001    0.000    0.001    0.000 {method 'random' of '_random.Random' objects}
    1    0.000    0.000    0.000    0.000 {posix.urandom}
 5003    0.089    0.000    0.089    0.000 {range}
    4    0.000    0.000    0.000    0.000 {time.time}
```

From this output, we can identify which modules and functions are heavily used. This allows us to either improve the function or refactor the code to reduce the number of calls to it.

 In the above example, clearly, bubble sort is taking too much time. See for yourself:

```
ncalls  tottime  percall  cumtime  percall filename:lineno(function)
    1    4.084    4.084    4.173    4.173 sorting.py:4(bubble_sort)
```

Looking at the `tottime` and `cumtime` for `bubble_sort`, we can see that it's the main consumer of time.

### Profiling a single statement

Sometimes it is not a good idea or not required/possible to profile an entire script. In those scenarios you can profile individual statements:  

```python
cProfile.run('sort.bubble_sort(random_items)')   
```

The stats, as before, are printed on to standard out.

```shell
$ python cprofile_simple.py
     10005 function calls in 3.732 seconds

Ordered by: standard name

ncalls  tottime  percall  cumtime  percall filename:lineno(function)
    1    0.000    0.000    3.732    3.732 <string>:1(<module>)
    1    3.653    3.653    3.732    3.732 sorting.py:4(bubble_sort)
 5001    0.001    0.000    0.001    0.000 {len}
    1    0.000    0.000    0.000    0.000 {method 'disable' of '_lsprof.Profiler' objects}
 5001    0.079    0.000    0.079    0.000 {range}  
```

## Profiling Memory Usage

So far, we've focused on execution time. Now, let's look at how to profile memory usage in a Python script.

I will show you a few examples of memory profiling using the `memory_profiler`  package.

```shell
pip install -U memory_profiler
```

`memory_profiler` requires that you decorate your function of interest with an `@profile` decorator:

```shell
$ python memprofile_sample.py
Filename: memprofile_sample.py

Line   Mem usage    Increment   Line Contents
10      8.7 MiB      0.0 MiB   @profile
11                             def test():
12      9.2 MiB      0.4 MiB       sort.bubble_sort(random_items)
13      9.2 MiB      0.0 MiB       sort.insertion_sort(random_items)
14      9.3 MiB      0.2 MiB       sort.quick_sort(random_items)
15      9.4 MiB      0.0 MiB       sort.heap_sort(random_items)
```

The output shows:

* __Line:__ The line number of the code that was profiled.
* __Mem usage:__ The memory usage of the Python interpreter after that line has been executed.
* __Increment:__ The difference in memory usage from the previous line.
* __Line Contents:__ The code that was profiled.

## Memory Leak

Python uses [reference counting][ref_reference_counting] to keep track of objects in use. What this means is each of the objects that the application creates holds a numeric count. This count represents the number of references to an object at any given time. The count is incremented every time a new reference to the object is created and decremented when a reference is deleted. This way,  when the ref-count of an object becomes zero, the Python interpreter knows that the object is no longer required and can be destroyed, thus reclaiming the memory used by that object.

If Python automatically handles deleting unwanted objects __*how does the memory leak?*__

A common way for the Python interpreter to know that an object is unwanted is by looking at the number of references it has. If a developer isn't careful about removing references, the count may never reach zero, preventing Python from reclaiming the memory. While this is a common cause of memory leaks, other more complex scenarios can also occur. However, for many applications, carefully managing references is a key part of preventing memory issues.

{{< note type="tip" title="How to spot a memory leak" >}}
How do I know if my application is leaking memory? Well, intuitively, if the memory usage of the application grows over time but the amount of data it holds remains the same, there is memory leak.
{{< /note >}}

> All the code used in this article is available [here][ref_my_github]

{{< newsletter type="simple" >}}

[ref_goldberg]:  http://coreygoldberg.blogspot.in/2012/06/python-timer-class-context-manager-for.html
[ref_my_github]: https://github.com/vijayanant/pyperf
[ref_profilers]: https://docs.python.org/2/library/profile.html  
[ref_profiling]: http://en.wikipedia.org/wiki/Profiling_(computer_programming)
[ref_reference_counting]: http://en.wikipedia.org/wiki/Reference_counting

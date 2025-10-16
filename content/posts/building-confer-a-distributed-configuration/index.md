---
title: "Building Confer A Distributed Configuration"
slug: "building-confer-a-distributed-configuration"
date: 
draft: true
---
First things first:

  * Why Rust? - Because I am learning Rust. 

  * How much of Rust do I know? - I started reading the Rust Book a week back and I have read all of the first 13 chapters!! (I did practice writing some code along the way, though!)

  * Why Confer? - Who doesn’t know Zookeeper? The idea is simple and there are more and more layers for me to implement later on. There are libs available for almost everything to get started, and I can keep on adding features and when time permits, I can replace a lib with my own version too. That simple. 

The goal is learning. Not just Rust, many frameworks, libs, technologies,
algorithms along the way. The distributed systems landscape is wide and deep.
At the least we will be going to encounter rpc for communication/network,
raft/paxos for consensus, etcd/consul for discovery. Happy journey.

## Initial Steps

I started by creating a key-value store as the foundation. This involved using
a `HashMap` protected by a `Mutex` for thread safety and wrapped in an `Arc`
for shared ownership.

    
    
    use std::collections::HashMap; 
    use std::sync::{Arc, Mutex};
      
    pub struct KVStore {
        data: Arc<mutex<hashmap<string, string="">&gt;&gt;,
    }  
    
    impl KVStore {
        pub fn new() -&gt; Self {
            println!("KVStore -&gt; new()"); 
            KVStore { 
                data: Arc::new(Mutex::new(HashMap::new())), 
            } 
        } 
    }  

I know HashMap may not be the right choice for the job and that is why I wrap
it with a KVStore structure. All I know, for sure, is that that I will use
some kind of key-value store (unlike Zookeeper which uses a tree like
structure.)

Once I had fixed my data structure (at least for now!), it was easy enough to
add core operations on it.

  * `get(path)`: retrieves the value at that path

  * `set(path, value)`: saves the value at given path 

  * `remove(path`): removes the given path (and the value) 

  * `list(path)`: lists all the paths in that hierarchy

    
    
    impl KVStore {
        pub fn set(&amp;self, path: &amp;str, value: String) {
            let mut data = self.data.lock().unwrap();
            data.insert(path.to_string(), value);
        }
    
        pub fn get(&amp;self, path: &amp;str) -&gt; Option<string> {
            let data = self.data.lock().unwrap();
            data.get(path).cloned()
        }
    
        pub fn delete(&amp;self, path: &amp;str) -&gt; bool {
            let mut data = self.data.lock().unwrap();
            data.remove(path).is_some()
        }
    
        pub fn list(&amp;self, prefix: &amp;str) -&gt; Vec<string> {
            let data = self.data.lock().unwrap();
            data.keys()
                .filter(|key| key.starts_with(prefix))
                .cloned()
                .collect()
        }
    }

Note that only ‘String’ values can be set. Which is ok for this project,
however, there might be a need for storing additional book keeping data
alongside the actual data. I don’t know what I might need in the future, I
will handle that in the future if a need arrives. For now we have a something
useful.

&gt; There is a reason we are wrapping the HashMap inside the KVStore. In future,
&gt; if we choose to use other more efficient data structures from a library or
&gt; write our own, the changes will be localised. Even if we want save metadata.
&gt; Unless the metadata has to come from outside. Then the interface will change
&gt; causing all the code that uses KVStore will also undergo changes
&gt; accordingly.

</string></string></mutex<hashmap<string,>
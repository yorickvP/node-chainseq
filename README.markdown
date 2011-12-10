Chainseq
========

It's like [SubStack's Seq](https://github.com/substack/node-seq), but it has less features, is simpler, hopefully less buggy, and more complicated. It doesn't have a stack. I'm not sure if anyone in their right mind uses that. If you do feel free to implement it, for example by prototyping from chainseq.prototype to implement the correct methods. The constructor makes some slight changes to the prototype to implement the variable hash.
The variable hash currently has few usage. I was thinking about implementing something like seq's this.into('x'), but the .into wouldn't know what the current keystore was (it's transferred via arguments).
Fortunately you can create your own functions to implement it. Just prototype from chainseq.prototype to add the desired functionality and pass it to the constructor function.

Examples
========

	var fs = require('fs')
	var exec = require('child_process').exec

	var Seq = require('./chainseq')
	Seq()
	    .seq(function () {
	        exec('whoami', this.next) })
	    .par([ function (vars, err, who) {
	        this.seq(function() {
	            exec('groups ' + who, this.next) })}
	         , function (vars, err, who) {
	        this.seq(function() {
	            fs.readFile(__filename, 'ascii', this.next) })}])
	    .seq(function (vars, res) {
	        // this would look really nice with mozilla desctructuring assignment
	        var groups = res[0][1]
	        var src = res[1][1]
	        console.log('Groups: ' + groups.trim())
	        console.log('This file has ' + src.length + ' bytes')
	    })
	    .run()

Things that possibly make you go 'ooh, nice'
============================================

- .seq(a).seq(b).seq(c) == .seq([a, b, c]).
- .seq also allows you to specify arguments although I have no idea why you would want that. It's used internally to give you the variable hash and why not expose it. .seq(a, [1,2]) == .seq([a, [1,2]])
- you can make nested .pars easily and think of the execution as some kind of tree.
- the arguments you pass into .run will be sent to your first function.
- The .run method is bound to the Seq object, so you can pass it around.
- .loop(function(end, vars) { /* call end() to end the loop */ })
- Specifying custom prototypes for the chain and variable hash. The branches at .par use them too.
- more stuff I can't think of right now.

Bugs
====
- .par breaks .stop(). Don't call it when parallel things are happening.
- People are complaining about my coding style. Beware, brave soul who looks at my code.

Missing stuff
=============
- this.into('x')
- stack
- documentation
- builtin error handling. not sure if I want that though (like .catch())
- way for standard .taps to pass arguments to the next function. could be done using some kind of this.setArgs() if there's any demand.

Caveats
=======

- The callback you should call from asynchronous methods is this.next(), not this(). Calling this() possibly silently fails if the node.js api decides it wants to.
- You can't do anything that uses this.tap internally within a .seq(), because that would be silly and lead to confusion, as the code wouldn't move on until you call this.next(). If you're stubborn anyways and want to do this, use .tap(cb, false, true).
- Likewise, you can't use this.next() inside .taps, unless you call it like .tap(cb, false, true). Calling this.next() in a non-asynchronous .tap will probably lead to strange behavior. 
- .par doesn't work like in Seq, and expects an array of functions that will be called as taps.
- you need to call .run to start execution.

Installation
============
	npm install chainseq

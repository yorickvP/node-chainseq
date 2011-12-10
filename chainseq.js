/* ----------------------------------------------------------------------------
Copyright (c) YorickvP (contact me on github if you want)

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * ---------------------------------------------------------------------------*/

var    ChainProvider = require('./chainprovider')
  ,         KeyStore = require('./keystore')

function ChainSeq(prototype, keystore_proto) {
    if (!prototype) prototype = ChainSeq.prototype
    var cp = ChainProvider(prototype)
    cp._keystore = KeyStore(keystore_proto)
    cp.next = cp.next.bind(cp) // bind that thing because people are likely to separate it
    cp.tap = function(f, nonest, async, args) {
        return prototype.tap.call(this, f, nonest, async, [this._keystore].concat(args || [])) }
    cp.flush = function() {
        return this.tap(function(k) { for (var x in k) delete k[x] }, true)}
    cp.into = function(target, f) {
        return this.tap(function() {
            var k = this._keystore
            this._keystore = k._set(target, KeyStore(null, k))
            f.apply(this, arguments)
            this._keystore = k })}
    return cp }

var Chain_Seq = Object.create(ChainProvider.prototype)

Chain_Seq.next = function next() {
	var args = Array.prototype.slice.call(arguments)
	  ,    n
	do {
		if (!(n = this._provide())) {
			if (args.length) console.log('warning: no function to absorb args')
			return this }
		n.f.apply(this, n.arguments.concat(args))
		if (args.length) args = [] }
	while(!n.async)
	return this }

Chain_Seq.run = function () {
	return this.next.apply(this, arguments) }

Chain_Seq.seq = function (f, args) {
	if (!Array.isArray(f))
		this.tap.call(this, f, true, true, args)
	else 
		for (var l = f.length, i = 0; i < l; ++i)
			if (Array.isArray(f[i])) this.seq.apply(this, f[i])
			else this.seq(f[i])
	return this }

// pass it an array, do stuff to it. yay!
Chain_Seq.par = function (fs) {
	if (!Array.isArray(fs)) console.log('NO! bad usage. BAD BAD BAD')
	var protos = [this, this._keystore].map(Object.getPrototypeOf)
	var count = fs.length
	var results = Array(fs.length)
	return this.seq(function (vars) {
		var next = this.next
		  , args = Array.prototype.slice.call(arguments, 1)
		fs.forEach(function(f, idx) {
			var s = ChainSeq.apply(null, protos)
			s._keystore = vars
			if (f.isArray) s.tap(f[0], false, false, f[1])
			else           s.tap(f)
			s.tap(function() {
				results[idx] = Array.prototype.slice.call(arguments, 1)
				if (--count == 0) next.call(null, results) }, false)
			s.run.apply(s, args) })})}

ChainSeq.prototype = Chain_Seq

if (module && module.exports)
	module.exports = ChainSeq

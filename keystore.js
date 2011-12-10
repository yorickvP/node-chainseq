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
function KeyStore(prototype, other) {
    return Object.create(prototype || (other ?
           Object.getPrototypeOf(other) : KeyStore.prototype)) }
Object.defineProperties(KeyStore.prototype,
  { _get: { value: function(x) {
        var t = x.split('.')
        return t.length == 1 ? this[x] :
           t.slice(0, -1).reduce(function(o, x) {
                return x in o ? o[x] : o[x] = KeyStore(null, this) }
        , this)[t[t.length - 1]] }}
  , _set: { value: function(x, y) {
        var t = x.split('.')
        return t.length == 1 ? this[x] = y :
           t.slice(0, -1).reduce(function(o, x) {
                return x in o ? o[x] : o[x] = KeyStore(null, this) }
            , this)[t[t.length - 1]] = y }}})
if (module && module.exports) {
    module.exports = KeyStore }


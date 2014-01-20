
/**
 * Module dependencies.
 */
var __slice = Array.prototype.slice;
var SchemaType = require('../schematype')
   ,CastError = SchemaType.CastError
   ,utils = require('../utils')
   ,Document

/**
 * Mixed SchemaType constructor.
 *
 * @param {String} path
 * @param {Object} options
 * @api private
 */

function StringRef (path, options) {
  // make sure empty array defaults are handled
  if (options &&
      options.default &&
      Array.isArray(options.default) &&
      0 === options.default.length) {
    options.default = Array;
  }

  SchemaType.call(this, path, options);
};

/**
 * Inherits from SchemaType.
 */
StringRef.prototype.__proto__ = SchemaType.prototype;

/**
 * Required validator for mixed type
 *
 * @api private
 */

StringRef.prototype.checkRequired = function (val) {
  return (val !== undefined) && (val !== null);
};

/**
 * Noop casting
 *
 * @param {Object} value to cast
 * @api private
 */

StringRef.prototype.cast = function (value, scope, init) {
  if (SchemaType._isRef(this, value, scope, init)) {
    // wait! we may need to cast this to a document

    if (null == value) {
      return value;
    }

    // lazy load
    Document || (Document = require('./../document'));

    if (value instanceof Document) {
      value.$__.wasPopulated = true;
      return value;
    }

    // setting a populated path
    if ('string' == typeof value) {
      return value;
    } else if (Buffer.isBuffer(value)){
      throw new CastError('string ref', value, this.path);
    } else if(!utils.isObject(value)){
      // string ref can be !!
      return value;
    }

    // Handle the case where user directly sets a populated
    // path to a plain object; cast to the Model used in
    // the population query.
    var path = scope.$__fullPath(this.path);
    var owner = scope.ownerDocument ? scope.ownerDocument() : scope;
    var pop = owner.populated(path, true);
    var ret = new pop.options.model(value);
    ret.$__.wasPopulated = true;
    return ret;
  }

  if (null === value) return value;
  if ('object' !== typeof value) return value;
  if(this.options && this.options.refPk){
    var tkf = this.options.refPk
      , keyValue = value[tkf]
    if(keyValue) {
      if(value && scope && undefined === init){
        return value;
      } else {
        if((false === init) || (undefined === init && undefined === scope))
          return keyValue;
        else
          return value
      }
    }
  } else {
    var result  = value[this.path]
    if(result) 
      return result
    else 
      return value
  }
  throw new CastError('string ref', value);
};

function handleSingle (val) {
  return this.castForQuery(val);
}

function handleArray (val) {
  var self = this;
  return val.map(function (m) {
    return self.castForQuery(m);
  });
}

StringRef.prototype.$conditionalHandlers = {
    '$ne': handleSingle
  , '$in': handleArray
  , '$nin': handleArray
  , '$gt': handleSingle
  , '$lt': handleSingle
  , '$gte': handleSingle
  , '$lte': handleSingle
  , '$all': handleArray
  , '$regex': handleSingle
  , '$options': handleSingle
};

StringRef.prototype.castForQuery = function ($conditional, val) {
  var handler;
  if (arguments.length === 2) {
    handler = this.$conditionalHandlers[$conditional];
    if (!handler)
      throw new Error("Can't use " + $conditional + " with StringRef.");
    return handler.call(this, val);
  } else {
    val = $conditional;
    return this.cast(val);
  }
};
/**
 * Module exports.
 */

module.exports = StringRef;

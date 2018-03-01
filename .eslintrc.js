'use strict';

module.exports = {
  "extends": "eslint-config-airbnb-es5",
  "env": {
    "browser": true,
    "node": true,
  },
  "rules": {
    //
    // Safety
    //
    "no-unused-vars": "warn",
    "no-alert": "warn",
    "no-console": "warn",
    "no-use-before-define": "warn",
    "no-var": "off",
    "block-scoped-var": "warn",
    "guard-for-in": "off",
    "no-shadow": "warn",
    "no-param-reassign": "off",

    //
    // Coding style
    //
    "indent": [ "warn", 2, { "SwitchCase": 1 } ],
    "padded-blocks": "off",
    "spaced-comment": "warn",
    "comma-dangle": [ "off" ],
    "space-in-parens": "off",
    "curly": [ "off", "all" ],
    "array-bracket-spacing": [ "warn", "always" ],
    "object-curly-spacing": [ "warn", "always" ],
    "computed-property-spacing": "off",
    "brace-style": [ "warn", "stroustrup", { "allowSingleLine": true } ],
    "no-trailing-spaces": [ "warn", { "skipBlankLines": true } ],
    "linebreak-style": [ "warn", "unix" ],
    "no-multiple-empty-lines": [ "warn", { "max": 2, "maxEOF": 1 } ],
    "eol-last": [ "error", "unix" ],
    "id-length": [ "warn", { "min": 2, "exceptions": [ "_", "$", "i", "j", "k", "x", "y", "e" ] } ],
    "camelcase": "off",
    "func-names": "off",
    "keyword-spacing": "warn",
    "space-before-blocks": "warn",
    "space-before-function-paren": [ "warn", { "anonymous": "always", "named": "never" } ],
    "quotes": [ "warn", "single", "avoid-escape" ],
    "no-multi-spaces": [ "warn", { "exceptions": { "VariableDeclarator": true, "ImportDeclaration": true } } ],
    "dot-notation": "off",
    "prefer-template": "off",
    "prefer-arrow-callback": "off",
    "max-len": [ "warn", 250, 4, { "ignoreComments": true } ],
    "arrow-parens": [ "warn", "always" ],
    "arrow-body-style": "off",
    "object-shorthand": "off",
    "no-case-declarations": "warn",
    "no-nested-ternary": "off",
    "global-require": "off",
    "no-underscore-dangle": "off",
    "no-useless-concat": "off",
    "no-mixed-operators": "off",
    "no-bitwise": "off",
    "no-plusplus": "off",
    "no-continue": "off",
    "newline-per-chained-call": "off",
    "no-restricted-syntax": [
      "error",
      "ForInStatement",
      "LabeledStatement",
      "WithStatement",
    ],
    "lines-around-directive": "off",
  },
  "globals": {
    "$": true,
    "_": true,
  }
};
'use strict';

const fs = require("fs");
const unleash = require('unleash-server');

const customAuth = require('./custom-auth-hook');

let options = {
    secret: process.env.SECRET,
    adminAuthentication: 'custom',
    preRouterHook: customAuth
};

unleash.start(options);
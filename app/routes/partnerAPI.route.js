const express = require('express');
const router = (module.exports = express.Router());
const controller = require('../controller/partnerService.controller');


router
  .post('/getAPIHeaders', controller.getHeaders)
  .post('/vatidateAPIHeaders', controller.vatidateHeaders)
  
.use((req, res) => {
    res.status(404).send({ success: false, message: 'Not an API route' });
  });
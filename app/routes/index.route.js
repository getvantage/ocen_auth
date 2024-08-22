module.exports = (app) => {
    app.use('/partnerAPI/v4.0.0alpha', require('./partnerAPI.route'));
    app.use((req, res) => {
      res.status(404).send({ success: false, message: 'Not an API route' });
    });
  };
  
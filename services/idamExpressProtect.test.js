const sinon = require('sinon');
const { expect } = require('chai');
const config = require('../config');
const idamWrapper = require('../wrapper');
const middleware = require('./idamExpressProtect');
const sinonStubPromise = require('sinon-stub-promise');

sinonStubPromise(sinon);

let req = null;
let res = null;
let next = null;
const idamArgs = {};

describe('idamExpressLanding', () => {
  it('should return a middleware handler', () => {
    const handler = middleware();
    expect(handler).to.be.a('function');
  });

  describe('middleware', () => {
    beforeEach(() => {
      req = {
        cookies: {},
        query: []
      };
      res = {
        redirect: sinon.stub(),
        cookie: sinon.stub(),
        clearCookie: sinon.stub()
      };
      next = sinon.stub();
    });

    {
      let idamExpressProtect = null;
      let getUserDetails = null;

      beforeEach(() => {
        getUserDetails = sinon.stub().returnsPromise();
        sinon.stub(idamWrapper, 'setup').returns({ getUserDetails });
        idamExpressProtect = middleware(idamArgs);
      });

      afterEach(() => {
        idamWrapper.setup.restore();
      });

      it('calls next on successful auth', () => {
        req.cookies[config.tokenCookieName] = 'token';

        idamExpressProtect(req, res, next);
        getUserDetails.resolves();

        expect(getUserDetails.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);
      });

      it('redirects if getUserDetails rejects', () => {
        req.cookies[config.tokenCookieName] = 'token';

        idamExpressProtect(req, res, next);
        getUserDetails.rejects();

        expect(res.redirect.callCount).to.equal(1);
      });

      it('cookie to be removed if getUserDetails rejects', () => {
        req.cookies[config.tokenCookieName] = 'token';

        idamExpressProtect(req, res, next);
        getUserDetails.rejects();

        expect(res.clearCookie.callCount).to.equal(1);
      });

      it('cookie to be removed if getUserDetails rejects', () => {
        req.cookies[config.tokenCookieName] = 'token';

        idamExpressProtect(req, res, next);
        getUserDetails.rejects();

        expect(res.clearCookie.callCount).to.equal(1);
      });
    }

    it('redirects if no token cookie', () => {
      const handler = middleware(idamArgs);
      handler(req, res, next);

      expect(res.redirect.callCount).to.equal(1);
    });
  });
});

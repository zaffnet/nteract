import chai, { expect } from 'chai';
import { unlinkObservable, createSymlinkObservable } from '../../src/utils/fs';
const sinon = require('sinon');
import * as fs from 'fs';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('unlinkObservable', () => {
  let sandbox;
  beforeEach(function() {
    this.sinon = sandbox = sinon.sandbox.create();
  });
  afterEach(function() {
    sandbox.restore();
  });
  it('it errors on unlink issue', (done) => {
    const existsSync = sinon.stub(fs, 'existsSync')
    const unlink = sinon.stub(fs, 'unlink')
    const nextBuffer = [];
    const subscription = unlinkObservable('path').subscribe(
      (x) => nextBuffer.push(x),
      (err) => { expect(err.message).to.equal('Testing... 1, 2, 3');
                 done();
               },
      () => done(),
    );
    debugger;
    expect(existsSync).to.be.calledWithMatch('path');
    expect(unlink).to.be.called;
  });
  it('completes and calls fs.existsSync, fs.unlink', (done) => {
    const existsSync = sinon.stub(fs, 'existsSync')
    const unlink = sinon.stub(fs, 'unlink')
    const nextBuffer = [];
    const subscription = unlinkObservable('path').subscribe(
      (x) => nextBuffer.push(x),
      (err) => expect.fail(err, null),
      () => { expect(nextBuffer.length).to.equal(1);
              done();
            }
    );
    expect(existsSync).to.be.calledWithMatch('path');
    expect(unlink).to.be.called;
  });
});

describe('createSymlinkObservable', () => {
  it('returns an observable', () => {
    expect(createSymlinkObservable('target', 'path').subscribe).to.not.be.null;
  });
});

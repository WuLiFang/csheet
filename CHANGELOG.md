# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [6.0.0-rc.1](https://github.com/WuLiFang/csheet/compare/v6.0.0-rc.0...v6.0.0-rc.1) (2020-04-27)


### Features

* allow hide cell overlay ([b34838c](https://github.com/WuLiFang/csheet/commit/b34838c12b78a1f66a43d6d82b3b859d5080d5ec))
* set transcode command priority with `nice` ([11af2c5](https://github.com/WuLiFang/csheet/commit/11af2c59d640f4d75009f55e3372cdac73a50148))


### Bug Fixes

* follow go module import compatibility rule ([4b41624](https://github.com/WuLiFang/csheet/commit/4b41624ad1a53ec57fae4e9ffda0d3c8a564f980))
* **deps:** update dependency vue-i18n to v8.17.4 ([36e7a34](https://github.com/WuLiFang/csheet/commit/36e7a3443b0c8e20b76bd508a3c29077279f603c))
* duplicated presentation id ([ced5e61](https://github.com/WuLiFang/csheet/commit/ced5e613f3729e0e38f2c1b07a5ab24d7936ff43))
* should hide app horizontal scroll bar ([27be0ab](https://github.com/WuLiFang/csheet/commit/27be0ab9d0cd2a4614d2a0505d371e006bcdb67d))
* **deps:** update dependency vue-i18n to v8.17.3 ([8eab7f1](https://github.com/WuLiFang/csheet/commit/8eab7f19cdca3859f2968ae4b19156525c25a84c))
* **deps:** update sentry monorepo to v5.15.5 ([faece69](https://github.com/WuLiFang/csheet/commit/faece69dc091d3be7b2b28b5707dbde43d80851c))

## [6.0.0-rc.0](https://github.com/WuLiFang/csheet/compare/v5.0.1...v6.0.0-rc.0) (2020-04-20)

### ⚠ BREAKING CHANGES

- rewrite with golang

### Features

- rewrite with golang ([5cc09c7](https://github.com/WuLiFang/csheet/commit/5cc09c75ebc03486d715abdd8796728dea97511d))

### [5.0.1](https://github.com/WuLiFang/csheet/compare/v5.0.0...v5.0.1) (2019-07-03)

### Bug Fixes

- always close `session_scope` ([0ed42cd](https://github.com/WuLiFang/csheet/commit/0ed42cd))
- **deps:** update dependency element-ui to v2.10.1 ([7f501b9](https://github.com/WuLiFang/csheet/commit/7f501b9))
- dispose engine at worker init, not at task start ([e5eddec](https://github.com/WuLiFang/csheet/commit/e5eddec))

## 5.0.0 (2019-07-01)

### Bug Fixes

- **deps:** update dependency vue-awesome to v3.5.4 ([b443e32](https://github.com/WuLiFang/csheet/commit/b443e32))
- database error when runing celery task ([d160190](https://github.com/WuLiFang/csheet/commit/d160190))
- **deps:** update dependency raven-js to v3.27.2 ([d04e11a](https://github.com/WuLiFang/csheet/commit/d04e11a))
- ignore EmptySelection error ([ebc1eb6](https://github.com/WuLiFang/csheet/commit/ebc1eb6))
- should remove session before celery task run ([76d1b9f](https://github.com/WuLiFang/csheet/commit/76d1b9f))
- **deps:** update dependency axios to v0.19.0 ([c62d226](https://github.com/WuLiFang/csheet/commit/c62d226))
- thread issue when use db session in celery task ([c9f0985](https://github.com/WuLiFang/csheet/commit/c9f0985))
- ts error ([1062bcc](https://github.com/WuLiFang/csheet/commit/1062bcc))
- **deps:** pin dependencies ([17785b2](https://github.com/WuLiFang/csheet/commit/17785b2))
- **deps:** update dependency element-ui to v2.10.0 ([ab15246](https://github.com/WuLiFang/csheet/commit/ab15246))
- **deps:** update dependency element-ui to v2.9.0 ([6826553](https://github.com/WuLiFang/csheet/commit/6826553))
- **deps:** update dependency element-ui to v2.9.1 ([8214bba](https://github.com/WuLiFang/csheet/commit/8214bba))
- **deps:** update dependency element-ui to v2.9.2 ([644dd42](https://github.com/WuLiFang/csheet/commit/644dd42))
- **deps:** update dependency raven-js to v3.27.1 ([4bd28e3](https://github.com/WuLiFang/csheet/commit/4bd28e3))
- **deps:** update dependency vue-awesome to v3.5.3 ([2a7a997](https://github.com/WuLiFang/csheet/commit/2a7a997))

### Build System

- add Makefile ([cd04217](https://github.com/WuLiFang/csheet/commit/cd04217))
- correct PYTHONPATH ([fbad69c](https://github.com/WuLiFang/csheet/commit/fbad69c))
- fix build ([037184b](https://github.com/WuLiFang/csheet/commit/037184b))
- fix missing entrypoint.sh ([79cacdf](https://github.com/WuLiFang/csheet/commit/79cacdf))
- fix wrong path ([78e5c4e](https://github.com/WuLiFang/csheet/commit/78e5c4e))
- let server Makefile support non-windows system ([b7ac21a](https://github.com/WuLiFang/csheet/commit/b7ac21a))

### Features

- **server:** extend sentry data ([f2ed485](https://github.com/WuLiFang/csheet/commit/f2ed485))
- **web:** extend sentry data ([bf90ac0](https://github.com/WuLiFang/csheet/commit/bf90ac0))
- delete task when it deleted from cgteamwork ([e821cb7](https://github.com/WuLiFang/csheet/commit/e821cb7))
- setup database migration ([2a06499](https://github.com/WuLiFang/csheet/commit/2a06499))

### Tests

- correct .coveragerc ([49c0e13](https://github.com/WuLiFang/csheet/commit/49c0e13))
- fix broken tests ([c27351f](https://github.com/WuLiFang/csheet/commit/c27351f))

## 5.0.0-rc4 (2019-01-10)

## 5.0.0-rc3 (2018-11-26)

## 5.0.0-rc2 (2018-11-23)

## 5.0.0-rc1 (2018-11-22)

## 4.9.0 (2018-09-25)

## 4.8.0 (2018-08-30)

## 4.7.0 (2018-08-29)

### 4.6.3 (2018-08-28)

### 4.6.1 (2018-08-24)

## 4.6.0 (2018-08-10)

## 4.5.0 (2018-08-02)

## 4.3.0 (2018-07-30)

## 4.2.0 (2018-07-25)

### 4.1.3 (2018-07-23)

### 4.1.2 (2018-07-23)

### 4.1.1 (2018-07-23)

## 4.1.0 (2018-07-23)

## 3.6.0 (2018-07-10)

### 3.5.3 (2018-06-29)

### 3.5.2 (2018-06-12)

### 3.5.1 (2018-06-12)

## 3.5.0 (2018-06-12)

## 3.4.0 (2018-06-11)

### 3.3.3 (2018-06-11)

### 3.3.2 (2018-06-11)

### 3.3.1 (2018-06-11)

## 3.3.0 (2018-06-11)

### 3.2.3 (2018-06-11)

### 3.2.2 (2018-06-11)

### 3.2.1 (2018-06-11)

## 3.2.0 (2018-06-11)

### 3.1.2 (2018-06-07)

### 3.1.1 (2018-06-07)

## 3.1.0 (2018-06-07)

## 3.0.0 (2018-06-07)

### 2.12.3 (2018-06-05)

### 2.12.2 (2018-06-05)

### 2.12.1 (2018-06-05)

## 2.12.0 (2018-06-05)

## 2.11.0 (2018-06-04)

## 2.10.0 (2018-06-04)

### 2.8.16 (2018-05-21)

### 2.8.15 (2018-05-21)

### 2.8.14 (2018-05-18)

### 2.8.13 (2018-05-08)

### 2.8.12 (2018-05-04)

### 2.8.11 (2018-05-04)

### 2.8.10 (2018-05-03)

### 2.8.9 (2018-05-03)

### 2.8.8 (2018-05-03)

### 2.8.7 (2018-05-03)

### 2.8.6 (2018-05-03)

### 2.8.5 (2018-05-03)

### 2.8.4 (2018-05-03)

### 2.8.2 (2018-05-03)

### 2.8.1 (2018-05-02)

## 2.8.0 (2018-05-02)

### 2.7.5 (2018-04-30)

### 2.7.4 (2018-04-28)

### 2.7.3 (2018-04-27)

### 2.7.2 (2018-04-27)

### 2.7.1 (2018-04-27)

## 2.7.0 (2018-04-27)

### 2.6.10 (2018-04-26)

### 2.6.9 (2018-04-26)

### 2.6.8 (2018-04-26)

### 2.6.7 (2018-04-26)

### 2.6.6 (2018-04-26)

### 2.6.5 (2018-04-26)

### 2.6.4 (2018-04-26)

### 2.6.3 (2018-04-26)

### 2.6.2 (2018-04-26)

### 2.6.1 (2018-04-25)

## 2.6.0 (2018-04-24)

### 2.5.3 (2018-04-20)

### 2.5.2 (2018-04-12)

### 2.5.1 (2018-04-12)

## 2.5.0 (2018-04-11)

### 2.4.2 (2018-04-11)

### 2.4.1 (2018-04-11)

## 2.4.0 (2018-04-11)

### 2.2.8 (2018-03-30)

### 2.2.7 (2018-03-30)

### 2.2.6 (2018-03-28)

### 2.2.5 (2018-03-26)

### 2.2.4 (2018-03-26)

### 2.2.3 (2018-03-26)

### 2.2.2 (2018-03-26)

### 2.2.1 (2018-03-26)

## 2.2.0 (2018-03-25)

### 2.1.4 (2018-03-25)

### 2.1.3 (2018-03-25)

### 2.1.2 (2018-03-25)

### 2.1.1 (2018-03-25)

## 2.1.0 (2018-03-24)

### 2.0.1 (2018-03-23)

## 2.0.0 (2018-03-23)

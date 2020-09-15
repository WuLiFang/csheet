# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [6.0.0-rc.3](https://github.com/WuLiFang/csheet/compare/v6.0.0-rc.2...v6.0.0-rc.3) (2020-09-15)


### ⚠ BREAKING CHANGES

* **api:** remove deprecated File type
* replace CollectedEvent with CollectResult

### Features

* **api:** remove deprecated File type ([ef7803d](https://github.com/WuLiFang/csheet/commit/ef7803d4b783a0416209cbe79d76a8c8d47e2444))
* replace CollectedEvent with CollectResult ([4be035d](https://github.com/WuLiFang/csheet/commit/4be035d50d82887144147b6f57445578357d2307))
* **api:** add cgteamworkProjects `name` `database` args ([7237940](https://github.com/WuLiFang/csheet/commit/72379403ce5b6c1de7f8eec131983c30ba327493))
* **api:** add cgteamworkProjects arg `q` ([84030f9](https://github.com/WuLiFang/csheet/commit/84030f9d83c508d02e525a9e2f415972de0bc977))
* **api:** cgteamworkProjects returns all projects ([c942595](https://github.com/WuLiFang/csheet/commit/c9425956724c3e2ca9671957922f2825194d9324))
* **api:** limit cgteamwork project search result to 20 ([1ab31ca](https://github.com/WuLiFang/csheet/commit/1ab31caec6e0cbbb69b124a862c94d1fe8922858))
* add issue tracker url to header ([da5bc01](https://github.com/WuLiFang/csheet/commit/da5bc017e9b7c6abedf508c813c096a10f7e7666))
* add notification for network error ([8c3b51a](https://github.com/WuLiFang/csheet/commit/8c3b51a02bd2b33b2e92ff91656c07ebd8cf8297))
* auto clear prefix input when project change ([d95372a](https://github.com/WuLiFang/csheet/commit/d95372a4d27602734ce93092c018096519578c35))
* improve browser detect ([e94cacd](https://github.com/WuLiFang/csheet/commit/e94cacd296e86b8f3a2d4ce86ac7411d2ac2dca8))
* nav bar form remember recent input ([4a5e96d](https://github.com/WuLiFang/csheet/commit/4a5e96d28a6f99b95c9009437180f1cbae95231a))
* only show active cgteamwork project when no query ([fbc94f3](https://github.com/WuLiFang/csheet/commit/fbc94f37e2c762ee9cf3f850b17c5da396ceb106))
* **api:** add cgteamworkProjects `status` arg ([bee4318](https://github.com/WuLiFang/csheet/commit/bee4318498fdd93aa7939ad581ae8efae6f51b3b))
* improve error notification ([2081bd3](https://github.com/WuLiFang/csheet/commit/2081bd3dba94909da01ad4bd96a799ae5cc564c0))
* live update collection that created after page load ([d02075d](https://github.com/WuLiFang/csheet/commit/d02075d338899ac692efe44124a75cc2348c5bf1))
* rename config CSHEET_FILE_WATCH_WORKERS -> CSHEET_WATCH_WORKERS ([7c03026](https://github.com/WuLiFang/csheet/commit/7c0302637846c2e42d0288a5eaf824b4a0fabc1f))
* schedule transocde jobs by weight ([d6d274b](https://github.com/WuLiFang/csheet/commit/d6d274ba2c5075c56fd19beb33f8aeab775f4356))
* set document title ([f1e1ccc](https://github.com/WuLiFang/csheet/commit/f1e1cccd2de8505bd03031bb6da4d27c80eed17c))
* set raw path data when drag presentation ([529ed78](https://github.com/WuLiFang/csheet/commit/529ed78e1f7540c37923c4fcc1610ea40a042121))
* set release for sentry ([a06e726](https://github.com/WuLiFang/csheet/commit/a06e726b8493b58078e6c6146778a65be3943d7b))
* support cgteamwork project select search ([1caa9a5](https://github.com/WuLiFang/csheet/commit/1caa9a5783fdf49f78e98d981221384d86445524))
* url param defaults to recent origin prefix ([cf6d6ec](https://github.com/WuLiFang/csheet/commit/cf6d6ecab0ebc4f7571148055d5631ee28436983))
* viewer presentation auto select by mod time ([d5b702c](https://github.com/WuLiFang/csheet/commit/d5b702c7d66cad7effdb86a6e7f334f841967135))
* **api:** support persisted queries ([e2a3284](https://github.com/WuLiFang/csheet/commit/e2a32847040a26a7d9ed0758de28bbb1fad48969))
* **style:** reset focus outline ([d62c88b](https://github.com/WuLiFang/csheet/commit/d62c88b5b07c5b42c52ccecfee38b2f329fc9b04))
* support worker number config ([390c35d](https://github.com/WuLiFang/csheet/commit/390c35d1b618a293e2b6b0905237dc8677b8da52))


### Bug Fixes

* babel config ([f83baea](https://github.com/WuLiFang/csheet/commit/f83baeacd406ef8aa745602fd46664d5fc16f25a))
* browser check always false ([24f0a3a](https://github.com/WuLiFang/csheet/commit/24f0a3a3a16fca5ee8fc0d0bf8f10e8699d4b7b8))
* collection overview fetchmore may got null ([afb6dd1](https://github.com/WuLiFang/csheet/commit/afb6dd163a860f757e33217fe94514052ab541a6))
* correct sentry stacktrace for zap ([51c220e](https://github.com/WuLiFang/csheet/commit/51c220e87420b61ddbde4567d6f5b9edde5ee221))
* eslint setup ([5dea4db](https://github.com/WuLiFang/csheet/commit/5dea4dbdd3dc51a3336c1546707455fd1c956dec))
* focus handling for CGTeamworkProjectSelect ([f7d0fc9](https://github.com/WuLiFang/csheet/commit/f7d0fc9dcf1e92df2fbaea0d2ed3ad58f8b533d3))
* initial load for CGTeamworkProjectSelect ([cb14eac](https://github.com/WuLiFang/csheet/commit/cb14eacb70669bd00d1e842f1ad710ed4ddc2460))
* key not found when watch file ([e754c4b](https://github.com/WuLiFang/csheet/commit/e754c4b94cdc2402070a3e717a48b0e44cd4fcae))
* merge existed cgteamwork collection data ([1e59304](https://github.com/WuLiFang/csheet/commit/1e59304b1bf858e12922c796edb2b3c4b4268034))
* missing presentation type icon ([cfc82c9](https://github.com/WuLiFang/csheet/commit/cfc82c9d008aa87d0a10134f7d93b6c1cb074e9e))
* nil pointer error related to api router ([c505704](https://github.com/WuLiFang/csheet/commit/c505704f21ae1b5aafdb234edf79d9a28f611a94))
* no-cache header for index.html ([2872dec](https://github.com/WuLiFang/csheet/commit/2872dec386058f5b57ee4d0d9ad8e7a084e38fa2))
* read 'find' of undefined ([c43cf93](https://github.com/WuLiFang/csheet/commit/c43cf931e7ae1ed33d2c2df3be0a08dd0ccd97fb))
* should listen storage event ([39125b5](https://github.com/WuLiFang/csheet/commit/39125b517e59b1c94fec1fae0c0931a74a2f1610))
* should live update collection data ([93efbbf](https://github.com/WuLiFang/csheet/commit/93efbbfc95cb0eea6653dbab948967cdaf1d41a7))
* should not pass input event listener to native element ([485ec9b](https://github.com/WuLiFang/csheet/commit/485ec9b6dd587ed025708b17f9c1666018eb89d4))
* should schedule transcode after file change ([a4fd06d](https://github.com/WuLiFang/csheet/commit/a4fd06db66caf9c98b9699a9c4fcff0470a91e7f))
* signal not skip event when receiver blocked ([5f11cce](https://github.com/WuLiFang/csheet/commit/5f11cce1eba298bf30839fd81ee408f5aeb72497))
* title initial database name ([ab888a9](https://github.com/WuLiFang/csheet/commit/ab888a9ef639c343ffdfc3671234a94f730e5d84))
* undefined property error in CGTeamworkProjectSelect ([7f0dd45](https://github.com/WuLiFang/csheet/commit/7f0dd45b147491790e05d7938bbc9c1d35aebe62))
* wrong CGTeamworkProjectSelect state after reload ([dd4cf08](https://github.com/WuLiFang/csheet/commit/dd4cf08ad4850fd3dcda86d725c6e481d92e2aee))
* wrong tabindex for invisible input ([08ec859](https://github.com/WuLiFang/csheet/commit/08ec859036c752ff53168b61dab4fcbfb7b2bcc7))
* **api:** subscription should not skip event ([2260aef](https://github.com/WuLiFang/csheet/commit/2260aefb1addcd5d43850723cd40f32854455a8d))
* **api:** wrong CGTeamworkProject.status type ([6c26293](https://github.com/WuLiFang/csheet/commit/6c26293247bf69ffaf013c54fbbdaafc124f909d))
* **deps:** update dependency apollo-utilities to v1.3.4 ([27e9dfc](https://github.com/WuLiFang/csheet/commit/27e9dfcc5f18d009451185aed572fa6de8cd074d))
* **deps:** update dependency cast-unknown to v0.1.6 ([11d3e06](https://github.com/WuLiFang/csheet/commit/11d3e06a0a4bd7b375fcfb5c28702362ea67e924))
* **deps:** update dependency cast-unknown to v0.1.8 ([844e239](https://github.com/WuLiFang/csheet/commit/844e239bfde16a41ff9c7cde206f122d5fd122ab))
* **deps:** update dependency localforage to v1.8.1 ([285a307](https://github.com/WuLiFang/csheet/commit/285a307621fd6f5ec836f3dc9f992cb666371f9c))
* **deps:** update dependency vue-i18n to v8.17.5 ([88d3828](https://github.com/WuLiFang/csheet/commit/88d3828f4067e058238432f5252d9dfacb640ce3))
* **deps:** update sentry monorepo to v5.19.2 ([ae5a04a](https://github.com/WuLiFang/csheet/commit/ae5a04aa4d6ad1f68fe9b012fc85868e0a58cc9b))
* **transcode:** duplicated job ([d9f3714](https://github.com/WuLiFang/csheet/commit/d9f3714f38312074eb877e6620318055205c88a8))
* **transcode:** should not mark presentation updated until transcode finish ([498db46](https://github.com/WuLiFang/csheet/commit/498db462a3ce918a3a7a7ed87668794892a6a42d))
* wrong presentation viewer count ([4150a5c](https://github.com/WuLiFang/csheet/commit/4150a5c898a945fea90b4034cd08cde80fbae082))
* **transcode:** repeat check presentation that file removed ([829be9d](https://github.com/WuLiFang/csheet/commit/829be9dc98798a1818bebf2cb8ebef32101d0b8e))
* wrong import ([214aa61](https://github.com/WuLiFang/csheet/commit/214aa615c02ecf03d587907ec83e5d0b83e4b69e))

## [6.0.0-rc.2](https://github.com/WuLiFang/csheet/compare/v6.0.0-rc.1...v6.0.0-rc.2) (2020-05-06)


### Features

* support checkboard background ([fa18693](https://github.com/WuLiFang/csheet/commit/fa186938a77a6fba021ef0829bc4415ca8160add))
* support sentry for server ([0caf2aa](https://github.com/WuLiFang/csheet/commit/0caf2aac5a64bbc5862daed31dc6b130134d46e2))
* support sentry for web ([36475fd](https://github.com/WuLiFang/csheet/commit/36475fd50348b16e4c1f114690e7cbf7e723f6de))
* **style:** add viewer button click animation ([51ed51d](https://github.com/WuLiFang/csheet/commit/51ed51d8bd4eff3fdd81f0a3cfcd19a8c6808eaa))
* **style:** improve viewer transition ([3f4e69e](https://github.com/WuLiFang/csheet/commit/3f4e69e8dab6fc9248993ac475d02ab6849b48d3))
* **style:** improve viewer transition for identical image ([3abb205](https://github.com/WuLiFang/csheet/commit/3abb2054279f6372e4686c7427982c3fd732fd07))


### Bug Fixes

* time widget recieve null value ([5237b93](https://github.com/WuLiFang/csheet/commit/5237b930622b9095be2ec9c79d38f3d603898643))
* **api:** should return null when no webfile ([de132e5](https://github.com/WuLiFang/csheet/commit/de132e5fa016af086ffa2656aa50ce4b62b1ea65))
* **style:** avoid video element resize in viewer ([9a7450a](https://github.com/WuLiFang/csheet/commit/9a7450a36d963ea7a8705cec1354c41a426708dc))
* remove danling presentation key ([6050264](https://github.com/WuLiFang/csheet/commit/6050264c1f915cbee01c1653ccfbbd3b26cfef7a))
* should not convert generated path ([ab6e4f7](https://github.com/WuLiFang/csheet/commit/ab6e4f775aac9eb62af98ed22bc9e2a4a9304f86))
* **style:** missing viewer drop down transition ([a599d35](https://github.com/WuLiFang/csheet/commit/a599d35363abdef0ec7f99c5bafa31676da10ce4))
* set cgtw close status priority ([08359a9](https://github.com/WuLiFang/csheet/commit/08359a9688b2fb246e5264d5c8b078e778ba4f31))
* viewer should also prefetch for current item ([92cbf9d](https://github.com/WuLiFang/csheet/commit/92cbf9d8c63ce8c015944444baa408d2efd377b8))

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

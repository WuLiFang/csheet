ping -n 1 google.com ^
    || pip config set global.index-url https://mirrors.aliyun.com/pypi/simple ^
    && cmd /c npm i -g mirror-config-china --registry=https://registry.npm.taobao.org

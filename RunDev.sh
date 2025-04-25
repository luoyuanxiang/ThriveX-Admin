set -e
# 如果 /thrive/admin下无文件则移动 /thrive/admin_source 目录覆盖
if [ ! -d "/thrive/admin" ]; then
    echo "admin目录不存在，开始初始化admin目录"
    if [ ! -d "/thrive/admin_source"];then
        echo "/thrive/admin_source目录不存在，请检查"
        exit 1
    fi
    mv /thrive/admin_source/* /thrive/admin
    if [ $? -ne 0 ]; then
        echo "admin目录初始化失败"
        exit 1
    fi
    echo "admin目录初始化完成"
fi
ls -l /thrive/admin
if [ ! -d "/thrive/admin/.env" ]; then
    if [ ! -d "/thrive/admin_source"];then
        echo "/thrive/admin_source目录不存在，请检查"
        exit 1
    fi
    echo "/thrive/admin/.env 不存在，开始初始化admin目录"
    rm -rf /thrive/admin
    mv /thrive/admin_source /thrive/admin
    if [ $? -ne 0 ]; then
        echo "admin目录初始化失败"
        exit 1
    fi
    echo "admin目录初始化完成"
fi
which npm
if [ $? -ne 0 ]; then
    echo "npm不存在m"
    exit 3
fi
cd /thrive/admin
if [ $? -ne 0 ]; then
    echo "进入 /thrive/admin 目录失败"
   exit 4
fi
echo "Start npm dev"
npm dev run
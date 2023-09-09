#!/bin/bash

function draw_info_box() {
    local date=$(date +%Y-%m-%d)
    local time=$(date +%H:%M:%S)
    local info="    [$date $time] $*    "

    tput setaf 3

    echo "┏${info//?/━}┓"
    echo "┃$(tput setaf 4)$info$(tput setaf 3)┃"
    echo "┗${info//?/━}┛"

    tput sgr 0

    # echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    # echo "$info"
    # echo

    # # sed -r 's/(.{8}) /\1\n/g' <<<$1 |
    # #     awk '{rest=(12 - length); printf "%s%s|\n", $0, substr(".........", 1, rest)}'
}

readonly AlgoViewDataFolderPath="../public/AlgoViewPage/data"
readonly AlgoViewDataJSFilePath="../public/AlgoViewPage/data/jsonGraphData.js"

function json_to_js() {
    # $1 = path_to_file.json
    draw_info_box "run python3 json2js.py $1 $AlgoViewDataJSFilePath"
    mkdir -p $AlgoViewDataFolderPath
    python3 json2js.py $1 $AlgoViewDataJSFilePath
}

draw_info_box "start run.sh $1"
cd ./scripts

# удаляем старые файлы
rm -rf ../public/AlgoViewPage/data/*
rm -rf output.json

if [[ $1 == *.json ]]; then # * is used for pattern matching
    draw_info_box ".json file has been loaded, just transfer it to the visualization system"

    # input.json --> jsonGraphData.js
    json_to_js $1
else
    draw_info_box ".xml file has been loaded, launch the architect"

    # input.xml --> output.json
    draw_info_box "run ./main $1 output.json"
    ./main $1

    # output.json --> jsonGraphData.js
    echo "\n"
    json_to_js "output.json"
fi

draw_info_box "done!"

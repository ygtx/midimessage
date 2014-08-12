;

var bpm = 120;
var baseTime = 8;
var bpmTimeMsec = 60 * 1 * 1 * 1000 / (bpm * baseTime); // 1/16 haku
var autoPlayTimer = null; 
var bpmCounterTimer = null;
var bpmWriterTimer = null; 
var words = "";
var bpmWriterPauseFlag = false;
var inputFocusFlag = false;


var eightWords = Array(8);
var score = [];

var button = {
    // col q
    "81" : ["Q"], "87" : ["W"], "69" : ["E"], "82" : ["R"], "84" : ["T"],
    "89" : ["Y"], "85" : ["U"], "73" : ["I"], "79" : ["O"], "80" : ["P"],

    // col a
    "65" : ["A"], "83" : ["S"], "68" : ["D"], "70" : ["F"], "71" : ["G"],
    "72" : ["H"], "74" : ["J"], "75" : ["K"], "76" : ["L"],

    // col z
    "90" : ["Z"], "88" : ["X"], "67" : ["C"], "86" : ["V"], "66" : ["B"],
    "78" : ["N"], "77" : ["M"], "75" : ["K"], "76" : ["L"],

    // controllers
    "49" : ["1"], "50" : ["2"], "32" : ["&nbsp;&nbsp;"], "13" : ["<br/>"],
    "8" : ["DEL"],
};



$(function() {
        /* -----------------------------------------------
         *
         * timers 
         *
         --------------------------------------------------*/

        function startBpmCount() {
            if (bpmCounterTimer != null) {
                clearInterval(bpmCounterTimer);
                bpmCounterTimer = null;
            }
            var bpmCounter = 0;       
            var bpmCounterDOM = $("#bpm-counter");
            bpmCounterDOM.html('&nbsp;&nbsp;&nbsp;&nbsp;');
            bpmCounterTimer = setInterval(function() {   
                    if (bpmCounter >= (baseTime * 4)) {
                        bpmCounterDOM.html('&nbsp;&nbsp;&nbsp;&nbsp;');
                        bpmCounter = 0;
                    }
                    if ((bpmCounter %  baseTime) != 0){
                        bpmCounterDOM.append('&nbsp;&nbsp;');
                    } else {
                        bpmCounterDOM.append('*');
                    }
                    bpmCounter++;
            },bpmTimeMsec);
        }

        function autoPlay() {
            var index = 0;
            autoPlayTimer = setInterval(
              function() {
                    if (index >= score.length) {
                        clearInterval(autoPlayTimer);
                        autoPlayTimer = null;
                        return;
                    }
                    var s = document.getElementById(score[index]);
                    if (s != null) {
                        myPlay(s, score[index]);
                    }
                    index++;
            },bpmTimeMsec);
            
            autoPlayTimer = null;
        }


        function startBaseBpmWriter() {
            var scoreLength = 0; 
            var counter = 0;
            bpmWriterTimer = setInterval(
                function() { 
                    if (counter >= (baseTime * 8)) {
                        stopBaseBpmWriter();
                    }

                    if (scoreLength == score.length) {
                        score[score.length] = '_';
                        $("#input-part").append('_');
                        counter++;
                    } else {
                        counter = 0
                    }
                    scoreLength = score.length;
            },bpmTimeMsec);
        }

        function stopBaseBpmWriter() {
            if (bpmWriterTimer != null) clearInterval(bpmWriterTimer);
            bpmWriterTimer = null;
        }

        /* ---------------------------------
        *
        * controller impl
        *
        ----------------------------------- */

        function myPlay(audio, pressedKey) {
            audio.load();
            // audio.currentTime = 0;
            audio.play();


            eightWords.push(pressedKey);
            if (typeof eightWords != undefined
                && eightWords.length == 10) {
                eightWords.splice(0, 1);
            }

            words += pressedKey + " ";
            if (words.length >= 10) {
                words = words.slice(-5);           
            }

            // console.log(eightWords.join(""));
            if (-1 != eightWords.join("").search( /MIDISPORT/ )) {
                $("#main-part").html('Midisport&trade;');
            } else {
                $("#main-part").html(words);
            }

            
        };

        function playMode(code) {

            console.log(code);
            bpmWriterPauseFlag = false; 

            if (button[code] != undefined) {
                var pressedKey = button[code][0];
                if (pressedKey == "1") {
                    stopBaseBpmWriter();
                    return;
                } else if (pressedKey == "2") {

                    if (autoPlayTimer == null) {
                        autoPlay();
                    } else {
                        stopAutoPlay();
                    }
                    return; 
                } else if (pressedKey == "DEL") {
                    if (score.length > 0) {
                        var i = score.length - 1;
                        var spliceCount = 0;
                        for (i >= 0; i--;) {
                            if (score[i] == "_") {
                                ++spliceCount;
                            } else {
                                ++spliceCount;
                                score.splice(score.length - 1 - spliceCount, spliceCount)
                                var inputPart = $("#input-part");
                                var inputPartLength = inputPart.html().length;
                                var deleteTarget = inputPart.html().substring(inputPartLength - 2, inputPartLength);
                                console.log(inputPartLength);
                                console.log(deleteTarget); 
                                if (deleteTarget == "> ") {
                                    inputPart.html(inputPart.html().slice(0, -5));
                                } else if(deleteTarget == "; ") {
                                    inputPart.html(inputPart.html().slice(0, -13));
                                } else {
                                    inputPart.html(inputPart.html().slice(0, -2));
                                }
                                break;
                            }
                        }
                    }

                    return;
                }
            } else {
                return;
            }

            if (bpmWriterTimer == null) {
                score = []; 
                $("#input-part").html("");
                startBaseBpmWriter();
            } 


            $("#input-part").append(pressedKey + ' ');
            score[score.length] = pressedKey;

            var s = document.getElementById(pressedKey);
            if (s != null) myPlay(s, pressedKey);
        }

        /* ---------------------------------
        *
        * controller
        *
        ----------------------------------- */

        $(window).load(function(e){
                $(".s-common").each(function() {
                        $(this).load();
                }); 

                startBpmCount();
        });

        $(window).keydown(function(e){
            
            var code = e.keyCode;
            if (!inputFocusFlag) {
                playMode(code);
            } else {
            }


        });
       
        $(document).unbind('keydown').bind('keydown', function (event) {
                var doPrevent = false;
                if (event.keyCode === 8) {
                    var d = event.srcElement || event.target;
                    if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE' || d.type.toUpperCase() === 'EMAIL' )) 
                        || d.tagName.toUpperCase() === 'TEXTAREA') {
                        doPrevent = d.readOnly || d.disabled;
                    }
                    else {
                        doPrevent = true;
                    }
                }

                if (doPrevent) {
                    event.preventDefault();
                }
        });

 
        $("input").focus(
            function() {
                inputFocusFlag = true;        
            }
        );

        $("input").blur(
            function() {
                inputFocusFlag = false;        
            }
        );

        /* -----------------------------------------------
         *
         * inputs
         *
         --------------------------------------------------*/

        $("#auto-play-bpm").change(function() {
                bpm = $(this).val();
                if (30 < bpm && bpm < 240) {
                    bpmTimeMsec = 60 * 1 * 1 * 1000 / (bpm * baseTime); 
                }
                console.log(bpm);
                console.log("bmpTimeSec is " + bpmTimeMsec);
                startBpmCount();
        });

        /* -----------------------------------------------
         *
         * buttons 
         *
         --------------------------------------------------*/

        $("#auto-play-button").click(function() {
                if (autoPlayTimer == null) {
                    autoPlay();
                } else {
                    stopAutoPlay();
                }
        });
}); 

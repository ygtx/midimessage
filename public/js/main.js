/*global $:false */
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
    "78" : ["N"], "77" : ["M"], 

    // c, 2
    // 1 or 2
    "49" : ["1"], "50" : ["2"], 
    // space
    "32" : ["&nbsp;&nbsp;"], 
    // enter
    "13" : ["<br/>"],
    // delete
    "8" : ["DEL"],
};


var sidrParams =  { side: 'right' };
var openFlag = false;


$(function() {
    "use strict";
    /* -----------------------------------------------
     *
     * timers 
     *
     --------------------------------------------------*/

    function startBpmCount() {
        if (bpmCounterTimer !== null) {
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
                if ((bpmCounter %  baseTime) !== 0){
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
                if (s !== null) {
                    myPlay(s, score[index]);
                }
                index++;
        },bpmTimeMsec);
        
        autoPlayTimer = null;
    }

    function stopAutoPlay() {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
    }


    function startBaseBpmWriter() {
        btnReadyStopOrGo();
        var scoreLength = score.length; 
        var counter = 0;
        bpmWriterTimer = setInterval(
            function() { 
                if (counter >= (baseTime * 8)) {
                    stopBaseBpmWriter();
                    return;
                }
                if (scoreLength === score.length) {
                    score[score.length] = '_';
                    $("#input-part").append('_');
                    counter++;
                } else {
                    counter = 0;
                }
                scoreLength = score.length;
        },bpmTimeMsec);
    }

    function stopBaseBpmWriter() {
        if (bpmWriterTimer !== null) {
            clearInterval(bpmWriterTimer);
        }
        bpmWriterTimer = null;
    }

    function btnReadyStopOrGo() {
        $("div#c_b_stop").show();
        $("div#c_b_go").hide();
    }

    function readyToStart() {
        autoPlayTimer = null; 
        bpmCounterTimer = null;
        bpmWriterTimer = null; 
        words = "";
        bpmWriterPauseFlag = false;
        inputFocusFlag = false;
        eightWords = Array(8);
        score = []; 
        $("#input-part").html("");
        btnReadyStopOrGo();
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
        if (typeof eightWords !== undefined && 
            eightWords.length === 10) {
            eightWords.splice(0, 1);
        }

        words += pressedKey + " ";
        if (words.length >= 10) {
            words = words.slice(-5);           
        }

        // console.log(eightWords.join(""));
        if (-1 !== eightWords.join("").search( /MIDISPORT/ )) {
            $("#main-part").html('Midisport&trade;');
        } else {
            $("#main-part").html(words);
        }
    }

    function playMode(code) {

        console.log(code);
        bpmWriterPauseFlag = false; 
        var pressedKey = '';

        if (button[code] !== undefined) {
            pressedKey = button[code][0];
            if (pressedKey === "1") {
                stopBaseBpmWriter();
                return;
            } else if (pressedKey === "2") {
                if (autoPlayTimer === null) {
                    autoPlay();
                } else {
                    stopAutoPlay();
                }
                return; 
            } else if (pressedKey === "DEL") {
                if (bpmWriterTimer !== null) {
                    return;
                }
                if (score.length > 0) {
                    var inputPart = $("#input-part");
                    var inputPartLength = inputPart.html().length;
                    var deleteTarget = inputPart.html().substring(inputPartLength - 2, inputPartLength);
                    console.log(inputPartLength);
                    console.log(deleteTarget); 
                    if (deleteTarget === "> ") {
                        inputPart.html(inputPart.html().slice(0, -5));
                    } else if(deleteTarget === "; ") {
                        inputPart.html(inputPart.html().slice(0, -13));
                    } else {
                        inputPart.html(inputPart.html().slice(0, -2));
                    }

                    score.pop();
                }
                return;
            }
        } else {
            return;
        }

        // start BPMWriter if it is stopped
        if (bpmWriterTimer === null) {
            startBaseBpmWriter();
        } 

        // store data in js
        $("#input-part").append(pressedKey + ' ');
        score[score.length] = pressedKey;

        // play audio actually
        var s = document.getElementById(pressedKey);
        if (s !== null) {
            myPlay(s, pressedKey);
        }
    }

    /* ---------------------------------
    *
    * controller
    *
    ----------------------------------- */


    $(window).keydown(function(e){
        
        var code = e.keyCode;
        if (!inputFocusFlag) {
            playMode(code);
        } else {
            console.log('off the playmode');
        }


    });
    
    $(document).unbind('keydown').bind('keydown', function (event) {
        /*jshint strict: false */
            var doPrevent = false;
            if (event.keyCode === 8) {
                var d = event.srcElement || event.target;
                if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE' || d.type.toUpperCase() === 'EMAIL' )) || 
                    d.tagName.toUpperCase() === 'TEXTAREA') {
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
            if (autoPlayTimer === null) {
                autoPlay();
            } else {
                stopAutoPlay();
            }
    });


    /* -----------------------------------------------
     *
     * window on load 
     *
     --------------------------------------------------*/

    $(window).load(function(){
            $(".s-common").each(function() {
                    $(this).load();
            }); 

            // initialize
            readyToStart();

            // start
            startBpmCount();

            $('#controller-opener').sidr(sidrParams);

            $("#main").mousemove(function(e) {
                var dx = e.pageX;
                var windowWidth = $(window).width();
                if (openFlag) {
                    if (dx < windowWidth - 350 ) {
                        $("#controller-opener").click();
                        openFlag = false;
                    }
                } else {
                    if (dx > windowWidth - 350 ) {
                        $("#controller-opener").click();
                        openFlag = true;
                    }
                } 
            });


            // restart
            $('#c_restart').click(function() {
                readyToStart();
            });

            // stop and go
            $('#c_stop_or_go').click(function() {
                if (bpmWriterTimer === null) {
                    autoPlay();
                } else {
                    stopBaseBpmWriter();
                    $("div#c_b_stop").hide();
                    $("div#c_b_go").show();
                }
                return;
            });

            // sidr close when mouse is out of screen
            $(window).blur(function() {
                $("#controller-opener").click();
                openFlag = false;
            });
                 
            // upload button action
            $('#upload-button').click(function() {
                $.ajax({
                    type: "POST",
                    url:"/upload",
                    data: { 'score[]' : score },
                    success: function(msg) {
                        console.log(msg);
                        var rows = msg.scoreTbl.rows;
                        for (var i = 0; rows.length; i++){
                            $('#sidr').children('ul').append(
                                '<li>' + 
                                '<p>' + 'name : ' + rows[i].id + '</p>' + 
                                '<p>' + 'sound :' + 'TODO' + '</p>' + 
                                '<p>' + 'score :' + rows[i].score_string + '</p>' + 
                                '</li>'
                            );
                        }
                    }
                 });
            });
    });
}); 


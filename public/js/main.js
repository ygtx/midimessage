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

var uploadedId = null;

// var eightWords = Array(8);
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

    function validateEmail(sEmail) {
        var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
        if (filter.test(sEmail)) {
            return true;
        }
        else {
            return false;
        }
    }



    /* -----------------------------------------------
     *
     * styles 
     *
     --------------------------------------------------*/

    function btnReadyToStop() {
        $("div#c_b_stop").show();
        $("div#c_b_go").hide();
        console.log(99);
    }

    function btnReadyToGo() {
        $("div#c_b_stop").hide();
        $("div#c_b_go").show();
        console.log(88);
    }

    function hideScoreListModal() {
        $('div#score-list-container').fadeOut(200);
    }
    function showScoreListModal() {
        $('div#score-list-container').fadeIn(200);
    }

    /* -----------------------------------------------
     *
     * set up 
     *
     --------------------------------------------------*/

    function initialize() {
        autoPlayTimer = null; 
        bpmCounterTimer = null;
        bpmWriterTimer = null; 
        words = "";
        bpmWriterPauseFlag = false;
        inputFocusFlag = false;
        // eightWords = Array(8);
        score = []; 
        $("#input-part").html("");
        btnReadyToStop();
        $("#main-part").html("*");
    }

    function loadSelectSound(soundId) {
        $.ajax({
            type: "POST",
            url: "/select_sound",
            data: { "sound_id" : soundId },
            success: function(data, status, xhr) {
                console.log(data);
                if (xhr.status === 200) {
                    if (data.APP_ERR) {
                        alert(data.APP_ERR);
                    } else {
                        $('#audioarea').html(data.dc);
                    }
                }
            }
        });
    }

    /* -----------------------------------------------
     *
     * timers 
     *
     --------------------------------------------------*/



    function startBaseBpmWriter() {
        btnReadyToStop();
        var scoreLength = score.length; 
        var counter = 0;
        bpmWriterTimer = setInterval(
            function() { 
                if (counter >= (baseTime * 4)) {
                    stopBaseBpmWriter();
                    return;
                }
                if (scoreLength === score.length) {
                    score[score.length] = '_';
                    // $("#input-part").append('_');
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
        btnReadyToGo();
    }

    function autoPlay() {
        var index = 0;
        btnReadyToStop();
        if (autoPlay !== null) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
        autoPlayTimer = setInterval(
          function() {
                if (index >= score.length) {
                    stopAutoPlay();
                    return;
                }
                if (score[index] !== '_') {
                    $("#input-part").append(score[index] + ' ');
                }
                var s = document.getElementById(score[index]);
                if (s !== null) {
                    myPlay(s, score[index]);
                }
                index++;
        },bpmTimeMsec);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
        stopBaseBpmWriter();
        if (score.length !== 0) {
            btnReadyToGo();
        }
    }

    function loadScore(hiddenID, soundId, displayScore, actualScore, nickName) {
        console.log('-------------- loading...'); 
        console.log(displayScore); 
        console.log('-------------- '); 
        console.log(actualScore); 
        var actualScoreArray = JSON.parse("[" + actualScore + "]");
        console.log('-------------- '); 
        console.log(actualScore); 
        console.log('-------------- '); 
        console.log(soundId);
        console.log('-------------- '); 

        $("#input-part").html(displayScore);
        $("#main-part").html("*");
        $("select#sound_name").val(soundId);
        $("input#c_t_nick_name").val(nickName);
        //score = actualScore;
        score = actualScoreArray;
        stopAutoPlay();
        btnReadyToGo();
    }


    /* ---------------------------------
    *
    * controller impl
    *
    ----------------------------------- */

    function myPlay(audio, pressedKey) {

        audio.load();
        audio.play();

        console.log(pressedKey);

        /*
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
        */
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

                    while (true) {
                        var spliced = score.splice(score.length - 1)[0];
                        if (spliced !== '_') {
                            break;
                        }
                    }
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
            uploadedId = null;
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

    $(".s-common").each(function() {
        $(this).load();
    }); 

    // initialize
    initialize();

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

    // click c_download
    $('input#download-button').click(function() {
        showScoreListModal();
    });

    // click score-list-close-button
    $('input#score-list-button').click(function() {
        hideScoreListModal();
    });


    // sidr ui
    $("div#sidr").scroll(function() {
        $("div.sidr_scores").css({
            height: $(window).height() - 340
        });
    });

    // click the others score
    $('li.generated_score_list').click(function() {
        var hiddenID = $(this).children(".hidden_id").val();
        var displayScore = $(this).children(".hidden_display_score").val();
        var nickName  = $(this).children(".score_list_name").html();
        var actualScore = $(this).children(".score_list_score").html();
        var soundId = $(this).children(".hidden_sound_id").val();

        loadScore(hiddenID, soundId, displayScore, actualScore, nickName);
        loadSelectSound(soundId);
        uploadedId = hiddenID;

        hideScoreListModal();
        window.history.pushState(null, null, '/load?score=' + uploadedId);
    });

    // restart
    $('#c_restart').click(function() {
        initialize();
        uploadedId = null;
    });

    // stop and go
    $('#c_b_stop').click(function() {
        stopAutoPlay();
        uploadedId = null;
    });
    $('#c_b_go').click(function() {
        $("#input-part").html("");
        autoPlay();
        uploadedId = null;
    });

    // sidr close when mouse is out of screen
    $(window).blur(function() {
        $("#controller-opener").click();
        openFlag = false;
    });

    // select sound
    $('select#sound_name').change(function() {
        var selectedSoundId = $(this).val();
        loadSelectSound(selectedSoundId);
        uploadedId = null;
    });

    $('input').change(function() {
        uploadedId = null;
    });

    // upload button action
    $('#upload-button').click(function() {
        if (uploadedId) {
            return alert('please type something another.');
        }
        var nickName = $('#c_t_nick_name').val();
        var inputPartDOM = $("#input-part");
        var selectedSoundId = $("select#sound_name").val();

        $.ajax({
            type: "POST",
            url:"/upload",
            data: { 
                'input_name' : nickName,
                'input_bpm' : bpm,
                'input_sound_id' : selectedSoundId,
                'display_score_string' : inputPartDOM.html(),
                'score[]' : score 
            },
            success: function(data, status, xhr) {
                console.log(data);
                if (xhr.status === 200) {
                    if (data.APP_ERR) {
                        alert(data.APP_ERR);
                    } else {
                        $('div#score-list').remove();
                        $('div#score-list-container').prepend(data.scoreList);
                        uploadedId = data.uploadedId;
                        console.log(uploadedId);
                        window.history.pushState(null, null, '/load?score=' + uploadedId);
                        $('.fb-send').attr('ref', uploadedId);
                        alert('saved');
                    }
                }
                console.log("---------------");
            }
        });
    });

    // mail button action
    $('#email-button').click(function() {
        var nickName = $('#c_t_nick_name').val();
        var inputPartDOM = $("#input-part");
        var selectedSoundId = $("select#sound_name").val();
        var emailAddress = $("input#c_t_mail_to").val();

        if (!emailAddress || emailAddress === null || !validateEmail(emailAddress)) {
            return alert('please input correct email address.');
        }
        if (uploadedId === null || uploadedId === undefined) {
            return alert('please save this before sending an email.');
        }


        $.ajax({
            type: "POST",
            url:"/send_mail",
            data: { 
                'input_name' : nickName,
                'input_bpm' : bpm,
                'input_sound_id' : selectedSoundId,
                'display_score_string' : inputPartDOM.html(),
                'score[]' : score,
                'email_address' : emailAddress,
                'uploaded_id' : uploadedId
            },
            success: function(data, status, xhr) {
                console.log(data);
                if (xhr.status === 200) {
                    if (data.APP_ERR) {
                        alert(data.APP_ERR);
                    } else {
                        window.history.pushState(null, null, '/load?score=' + uploadedId);
                        $('.fb-send').attr('ref', uploadedId);
                        alert('mail has been sent.');
                    }
                }
                console.log("---------------");
            }
        });

    });

    // if load
    var parameters = location.href.split("?");
    console.log(parameters);
    if (parameters[1]) {
        var params  = parameters[1].split("&");
        var paramsArray = {};
        for ( var i = 0; i < params.length; i++ ) {
            var neet = params[i].split("=");
            paramsArray[neet[0]] = neet[1];
        }

        var scoreId  = paramsArray.score || paramsArray.fb_ref;

        if (scoreId && $.isNumeric(scoreId)) {
            console.log($("li.score_id_is_" + scoreId));
            $("li.score_id_is_" + scoreId).click();
        }
    }

    $("input#facebook-button").click(function() {
        location.href = "fb://post?body=";
    });
});

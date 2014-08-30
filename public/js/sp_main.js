/*global $:false */
/*jslint node: true */
"use strict";

var bpm = 120;
var baseTime = 8;
var bpmTimeMsec = 60 * 1 * 1 * 1000 / (bpm * baseTime); // 1/16 haku
var autoPlayTimer = null; 
var bpmCounterTimer = null;
var bpmWriterTimer = null; 
var score = [];



$(function() {

    // function validateEmail(sEmail) {
    //     var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    //     if (filter.test(sEmail)) {
    //         return true;
    //     }
    //     else {
    //         return false;
    //     }
    // }



    /* -----------------------------------------------
     *
     * styles 
     *
     --------------------------------------------------*/

    function initializeControllers() {
        $("div#c_b_stop_or_go_container").fadeIn(200);
        $("div#c_nav_after_play_container").hide();
        $("div#c_nav_share_container").hide();
    }


    function btnReadyToStop() {
        initializeControllers();
        $("div#c_b_go").fadeOut(200);
    }

    function btnReadyToGo() {
        initializeControllers();
        $("div#c_b_go").fadeIn(200);
    }


    function showAfterPlayController() {
        $("div#c_b_stop_or_go_container").hide();
        $("div#c_nav_after_play_container").fadeIn(200);
        $("div#c_nav_share_container").hide();
    }

    function toggleAfterPlayButtons(showOrHide) {
        if (showOrHide === null) {
           $("div#c_nav_after_play").toggle("slow");
        } else {
           $("div#c_nav_after_play").toggle("slow", showOrHide);
        }
    }

    function showShareController() {
        $("div#c_b_stop_or_go_container").hide();
        $("div#c_nav_after_play_container").hide();
        $("div#c_nav_share_container").fadeIn(200);
    }

    /* -----------------------------------------------
     *
     * set up 
     *
     --------------------------------------------------*/

    function loadScore(actualScore) {
        $("div#c_b_stop_or_go_container").show();
        $("div#c_nav_after_play_container").hide();
        autoPlayTimer = null; 
        bpmCounterTimer = null;
        bpmWriterTimer = null; 
        // console.log('loading...'); 
        // console.log(displayScore); 
        // console.log(actualScore); 
        // console.log(soundId);
        score = actualScore;

        console.log(score);
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

        $("#input-part").append(pressedKey + ' ');
    }

    /* -----------------------------------------------
     *
     * timers 
     *
     --------------------------------------------------*/

    function autoPlay() {
        var index = 0;
        if (autoPlay !== null) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
        autoPlayTimer = setInterval(
          function() {

                console.log("************* now auto play");


                if (index >= score.length) {
                    stopAutoPlay();
                    showAfterPlayController();
                    return;
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
        if (score.length !== 0) {
            btnReadyToGo();
        }
    }

    /* -----------------------------------------------
     *
     * window on load 
     *
     --------------------------------------------------*/

    $(window).load(function(){
            $(".s-common").each(function() {
                    $(this).load();
            }); 

            // stop and go
            $('#c_b_stop').click(function() {
                stopAutoPlay();
                btnReadyToGo();
            });
            $('#c_b_go').click(function() {
                autoPlay();
                btnReadyToStop();
            });

            $("div#c_nav_after_play_shower").click(function() {
                toggleAfterPlayButtons(null);
            });

            $("li#c_b_reload").click(function() {
                autoPlay();
                btnReadyToStop();
            });

            $("li#c_b_show_socials").click(function() {
                showShareController();
            });

            


            // mail button action
            $('#email-button').click(function() {
                
            });

            initializeControllers();

            // var hiddenID = $(this).children(".hidden_id").val();
            // var soundId = $(this).children(".hidden_sound_id").val();
            // var soundName = $(this).children(".hidden_sound_name").val();
            // var displayScore = $(this).children(".hidden_display_score").val();
            // var nickName  = $(this).children(".hidden_nick_name").html();
            
            var actualScore = (".hidden_actual_score").val();
            loadScore(actualScore);
            btnReadyToGo();

    });
}); 


// As defined event time
const eventStart = 1740270653; // Unix time

// Variable event time
let eventVarTime = eventStart;

// Project preparation time
const projectPrepareTime = 60*3-2;

// Is project prepared
let isProjectPrepareing = false;

// Event video element
const videoElement = document.getElementById('myVideo');
const systemAudio = new Audio('ogg.mp3');
systemAudio.loop = true;
systemAudio.preload='auto';

function updateTimeAtWaitingArea() {
    let currentTime = parseInt(new Date().getTime() / 1000); // Time in seconds
    let timeDifference = eventVarTime - currentTime;

    // Checking for product prepration time
    if(!isProjectPrepareing && timeDifference <= projectPrepareTime){
        eventVarTime = currentTime + projectPrepareTime;
        timeDifference = projectPrepareTime;
        isProjectPrepareing = true;

        // Sending user the information that project is ready just preparing a valid link
        document.getElementById('quickMessage').innerText = 'Project is ready requesting server the project link...';
    }

    let timeFormat = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    };
    
    // Time to turn off audio
    if (!systemAudio.paused && timeDifference < 136)
        fadeOutAudio(systemAudio);

    // Checking for a valid time difference
    if (timeDifference < 135)
        return false;

    // Finding days left
    while (timeDifference >= 86400) {
        // Updating time format
        timeFormat.days++;

        // Decrementing values
        timeDifference -= 86400;
    }

    // Finding hours left
    while (timeDifference >= 3600) {
        // Updating time format
        timeFormat.hours++;

        // Decrementing values
        timeDifference -= 3600;
    }

    // Finding minutes left
    while (timeDifference >= 60) {
        // Updating time format
        timeFormat.minutes++;

        // Decrementing values
        timeDifference -= 60;
    }

    // Defining the seconds left
    timeFormat.seconds = timeDifference;

    // Updating the values at the html side
    // Updating days element
    document.getElementById('days').innerText = timeFormat.days;
    // Updating hours element
    document.getElementById('hours').innerText = timeFormat.hours;
    // Updating minutes element
    document.getElementById('minutes').innerText = timeFormat.minutes;
    // Updating seconds element
    document.getElementById('seconds').innerText = timeFormat.seconds

    // Sending success response
    return true;
}


// Prepare project function
function prepareProject() {
    // Switching project screen
    document.getElementById('eventPending').classList.remove('active');
    setTimeout(() => {
        document.getElementById('eventAboutToStart').classList.add('active');
        setTimeout(() => {
            videoElement.play();
        }, 1000);
    }, 1000);
}


// Checking document interaction
document.getElementById('interactDocument').onclick = () => {
    // Switching pages
    document.getElementById('introPage').classList.remove('active');
    setTimeout(() => {
        document.getElementById('eventPending').classList.add('active');
    },1000);
}

// Launch the project url
videoElement.onended = ()=>{
    window.location.replace('https://www.youtube.com');
}

// Audio controller
function fadeOutAudio(audio) {
    const duration = 4000;   // Duration to fade out over (in milliseconds)
    const intervalTime = 50; // Time between each volume adjustment (in milliseconds)
    
    const step = audio.volume / (duration / intervalTime);

    const interval = setInterval(() => {
        if (audio.volume > 0) {
            audio.volume = Math.max(0, audio.volume - step); // Reduce volume, but don't go below 0
        } else {
            clearInterval(interval);
            audio.volume = 0; // Ensure exact volume 0

            // Turing audio off
            audio.pause();
        }
    }, intervalTime);
}

// Code fetch by bilal from chatgpt to fetch binary data from server at exterame real time syncing of the time at client side
async function streamVideo(url) {
    const response = await fetch(url);
    const reader = response.body.getReader();

    const stream = new ReadableStream({
        async start(controller) {
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                // Enqueue the next chunk into the stream
                controller.enqueue(value);
            }
            controller.close();
        }
    });

    const videoBlob = new Blob([stream], { type: 'video/mp4' });
    const videoURL = URL.createObjectURL(videoBlob);
    videoElement.src = videoURL;
}

// Stream the video from a URL
// streamVideo('path_to_your_video/video.mp4');

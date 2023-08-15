if (window.innerWidth < 600) {
    document.body.innerText = "OldTube is best viewed on a desktop computer"
}

import { txtViews, subscribed, likedVideos, diLikes, diSubscriptions, btnLikes, btnDislike, btnLike, btnFullScreen, scrubBar, btnPlay, guestList, btnPost, txtGuestName, txtMessage, diViewer, diUpload, btnUpload, btnFile, txtTitle, txtDesc, txtUploader, btnStart, btnCancel, newVideosContainer, randomVideosContainer, videoPlayer, playerTitle, playerUploader, playerVideos, diSearch, searchVideos, txtSearch, btnSearch, txtComment, txtUsername, btnComment, commentSection, playerDescription } from "./references.js"

btnUpload.addEventListener("click", () => {
    diUpload.showModal() 
})

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getDatabase, push, ref, get, query, limitToLast, remove, update } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
import { getStorage, uploadBytes, ref as sRef, getDownloadURL, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

import { firebaseConfig } from "./firebase.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app)
const storage = getStorage(app)
const auth = getAuth(app)

var Files = []
var storageRef

var currentVideo = ""

if (localStorage.username !== undefined) {
    txtUsername.value = localStorage.username
}

txtUsername.addEventListener("keyup", () => {
    localStorage.username = txtUsername.value
})

btnComment.addEventListener("click", () => {
    if (txtComment.value !== "" && txtUsername.value !== "" && currentVideo !== "") {
        push(ref(db, "Videos/" + currentVideo + "/Comments"), {
            Author: txtUsername.value,
            Message: txtComment.value
        }).then(() => {
            txtComment.value = ""
            getComments()
        })
    }
})

btnPost.addEventListener("click", () => {
    if (txtMessage.value !== "" && txtGuestName.value !== "") {
        push(ref(db, "GuestList"), {
            Author: txtUsername.value,
            Message: txtMessage.value
        }).then(() => {
            txtMessage.value = ""
            getPosts()
        })
    }
})

var playing = false

btnPlay.addEventListener("click", () => {
    if (playing == false) {
        videoPlayer.play()
        btnPlay.innerText = "||"
        playing = true
    } else if (playing == true) {
        videoPlayer.pause()
        btnPlay.innerText = "▶"
        playing = false
    }
})

videoPlayer.onloadeddata = () => {
    scrubBar.value = 0
    scrubBar.max = videoPlayer.duration
}

videoPlayer.onplay = () => {
    var playing = setInterval(() => {
        scrubBar.value = videoPlayer.currentTime
    }, 1000)
    videoPlayer.onended = () => {
        clearInterval(playing)
    }
}

btnFullScreen.addEventListener("click", () => {
    videoPlayer.requestFullscreen()
})

getPosts()

btnSearch.addEventListener("click", () => {
    search()
})

onAuthStateChanged(auth, (user) => {
    btnLikes.onclick = () => {
        diLikes.showModal()
        get(ref(db, "Videos")).then((snap) => {
            snap.forEach((video) => {
                get(ref(db, "Videos/" + video.key + "/Likes/" + user.uid)).then((snap) => {
                    if (snap.exists()) {
                        const videoContainer = document.createElement("div")
                        videoContainer.className = "video"
                
                        const vidElement = document.createElement("video")
                        vidElement.className = "thumbnail"
                        vidElement.src = video.val().Video
                
                        const vidTitle = document.createElement("h5")
                        vidTitle.className = "videoTitle"
                        vidTitle.innerText = video.val().Title
                
                        vidTitle.addEventListener("click", () => {
                            currentVideo = video.key
                            videoPlayer.src = video.val().Video
                            playerTitle.innerText = video.val().Title
                            playerUploader.innerText = video.val().Uploader
                            playerDescription.innerText = video.val().Description
                            getRandom()
                            getComments()
                            getLikes()
                            getDislikes()
                            diViewer.showModal()
                        })
                
                        const vidUploader = document.createElement("p")
                        vidUploader.className = "videoUploader"
                        vidUploader.innerText = video.val().Uploader
                
                        videoContainer.appendChild(vidElement)
                        videoContainer.appendChild(vidTitle)
                        videoContainer.appendChild(vidUploader)
                        likedVideos.prepend(videoContainer)
                    }
                })  
            })
        })
    }
})

get(query(ref(db, "Videos"), limitToLast(5))).then((snap) => {
    snap.forEach((video) => {
        const videoContainer = document.createElement("div")
        videoContainer.className = "video"

        const vidElement = document.createElement("video")
        vidElement.className = "thumbnail"
        vidElement.src = video.val().Video

        const vidTitle = document.createElement("h5")
        vidTitle.className = "videoTitle"
        vidTitle.innerText = video.val().Title

        vidTitle.addEventListener("click", () => {
            currentVideo = video.key
            videoPlayer.src = video.val().Video
            playerTitle.innerText = video.val().Title
            playerUploader.innerText = video.val().Uploader
            playerDescription.innerText = video.val().Description
            getRandom()
            getComments()
            getLikes()
            getDislikes()
            diViewer.showModal()
        })

        const vidUploader = document.createElement("p")
        vidUploader.className = "videoUploader"
        vidUploader.innerText = video.val().Uploader

        videoContainer.appendChild(vidElement)
        videoContainer.appendChild(vidTitle)
        videoContainer.appendChild(vidUploader)
        newVideosContainer.prepend(videoContainer)
    })
})

var selection = []

get(ref(db, "Videos")).then((snap) => {
    snap.forEach((video) => {
        selection.push(video.key)
    })
}).then(() => {
    for (let i = 0; i < selection.length; i++) {
        get(ref(db, "Videos/" + selection[Math.floor(Math.random() * selection.length)])).then((snap) => {
            const videoContainer = document.createElement("div")
            videoContainer.className = "video"

            const vidElement = document.createElement("video")
            vidElement.className = "thumbnail"
            vidElement.src = snap.val().Video

            const vidTitle = document.createElement("h5")
            vidTitle.className = "videoTitle"
            vidTitle.innerText = snap.val().Title

            vidTitle.addEventListener("click", () => {
                currentVideo = snap.key
                videoPlayer.src = snap.val().Video
                playerTitle.innerText = snap.val().Title
                playerUploader.innerText = snap.val().Uploader
                playerDescription.innerText = snap.val().Description
                getRandom()
                getComments()
                getLikes()
                getDislikes()
                diViewer.showModal()
            })

            const vidUploader = document.createElement("p")
            vidUploader.className = "videoUploader"
            vidUploader.innerText = snap.val().Uploader

            videoContainer.appendChild(vidElement)
            videoContainer.appendChild(vidTitle)
            videoContainer.appendChild(vidUploader)
            randomVideosContainer.prepend(videoContainer)
        })
    }
})

btnFile.addEventListener("click", () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".mp4"
    input.click()
    
    input.onchange = (e) => {   
        btnFile.innerText = input.value
        Files = e.target.files
        storageRef = sRef(storage, "Vidoes/" + input.value)

        btnStart.addEventListener("click", () => {
            if (input.value !== "" && txtTitle.value !== "" && txtUploader.value !== "" && txtDesc.value !== "") {
                txtTitle.disabled = true
                txtUploader.disabled = true
                txtDesc.disabled = true
                btnFile.disabled = true
                btnStart.disabled = true
                btnCancel.disabled = true
                btnStart.innerText = "Uploading..."

                var uploadTask = uploadBytesResumable(storageRef, Files[0])

                uploadTask.on("state_changed", (snap) => {
                    btnStart.innerText = `${parseInt((snap.bytesTransferred / snap.totalBytes) * 100)}%` 
                })

                uploadBytes(storageRef, Files[0]).then(() => {
                    getDownloadURL(storageRef).then((url) => {
                        push(ref(db, "Videos"), {
                            Title: txtTitle.value,
                            Uploader: txtUploader.value,
                            Description: txtDesc.value,
                            Video: url
                        }).then(() => {
                            window.location.reload()
                        })
                    })
                }).catch((error) => {
                    const alert = document.createElement("p")
                    alert.style.backgroundColor = "red"
                    alert.style.color = "white"
                    alert.style.fontFamily = "sans-serif"
                    alert.innerText = "There was an error while uploading: " + error

                    txtTitle.disabled = false
                    txtUploader.disabled = false
                    txtDesc.disabled = false
                    btnFile.disabled = false
                    btnStart.disabled = false
                    btnCancel.disabled = false
                    btnStart.innerText = "Upload"

                    diUpload.appendChild(alert)
                    console.error(error)
                })
            }
        })
    }
})

function search() {
    if (txtSearch.value !== "") {
        diSearch.showModal()
        searchVideos.innerHTML = ""
        get(ref(db, "Videos")).then((snap) => {
            snap.forEach((video) => {
                if (video.val().Title.includes(txtSearch.value)) {
                    const videoContainer = document.createElement("div")
                    videoContainer.className = "video"

                    const vidElement = document.createElement("video")
                    vidElement.className = "thumbnail"
                    vidElement.src = video.val().Video

                    const vidTitle = document.createElement("h5")
                    vidTitle.className = "videoTitle"
                    vidTitle.innerText = video.val().Title

                    vidTitle.addEventListener("click", () => {
                        currentVideo = video.key
                        videoPlayer.src = video.val().Video
                        playerTitle.innerText = video.val().Title
                        playerUploader.innerText = video.val().Uploader
                        playerDescription.innerText = video.val().Description
                        getRandom()
                        getComments()
                        getLikes()
                        getDislikes()
                        diViewer.showModal()
                    })

                    const vidUploader = document.createElement("p")
                    vidUploader.className = "videoUploader"
                    vidUploader.innerText = video.val().Uploader

                    videoContainer.appendChild(vidElement)
                    videoContainer.appendChild(vidTitle)
                    videoContainer.appendChild(vidUploader)
                    searchVideos.prepend(videoContainer)
                }
            })
        })
    }
}

function getComments() {
    get(ref(db, "Videos/" + currentVideo + "/Comments")).then((snap) => {
        commentSection.innerHTML = ""
        snap.forEach((comment) => {
            const container = document.createElement("div")
            container.style.borderWidth = "1px"
            container.style.borderLeftWidth = "3px"
            container.style.borderColor = "transparent"
            container.style.borderLeftColor = "gray"
            container.style.paddingLeft = "5px"
            container.style.borderStyle = "solid"

            const author = document.createElement("h4")
            author.innerText = comment.val().Author
            author.style.margin = "0"

            const message = document.createElement("p")
            message.innerText = comment.val().Message
            message.style.margin = '0'

            container.appendChild(author)
            container.appendChild(message)
            commentSection.prepend(container)
        })
    })
}

function getPosts() {
    get(ref(db, "GuestList")).then((snap) => {
        guestList.innerHTML = ""
        snap.forEach((comment) => {
            const container = document.createElement("div")
            container.style.borderWidth = "1px"
            container.style.borderLeftWidth = "3px"
            container.style.borderColor = "transparent"
            container.style.borderLeftColor = "gray"
            container.style.paddingLeft = "5px"
            container.style.borderStyle = "solid"

            const author = document.createElement("h4")
            author.innerText = comment.val().Author
            author.style.margin = "0"

            const message = document.createElement("p")
            message.innerText = comment.val().Message
            message.style.margin = '0'

            container.appendChild(author)
            container.appendChild(message)
            guestList.prepend(container)
        })
    })
}

function getRandom() {
    playerVideos.innerHTML = ""

    var selection = []

    get(ref(db, "Videos")).then((snap) => {
        snap.forEach((video) => {
            selection.push(video.key)
        })
    }).then(() => {
        for (let i = 0; i < selection.length; i++) {
            get(ref(db, "Videos/" + selection[Math.floor(Math.random() * selection.length)])).then((snap) => {
                const videoContainer = document.createElement("div")
                videoContainer.className = "video"

                const vidElement = document.createElement("video")
                vidElement.className = "thumbnail"
                vidElement.src = snap.val().Video

                const vidTitle = document.createElement("h5")
                vidTitle.className = "videoTitle"
                vidTitle.innerText = snap.val().Title

                vidTitle.addEventListener("click", () => {
                    currentVideo = snap.key
                    videoPlayer.src = snap.val().Video
                    playerTitle.innerText = snap.val().Title
                    playerUploader.innerText = snap.val().Uploader
                    playerDescription.innerText = snap.val().Description
                    getRandom()
                    getComments()
                    getLikes()
                    getDislikes()
                    diViewer.showModal()
                })

                const vidUploader = document.createElement("p")
                vidUploader.className = "videoUploader"
                vidUploader.innerText = snap.val().Uploader

                videoContainer.appendChild(vidElement)
                videoContainer.appendChild(vidTitle)
                videoContainer.appendChild(vidUploader)
                playerVideos.prepend(videoContainer)
            })
        }
    })
}

function getLikes() {

    // add views

    onAuthStateChanged(auth, (user) => {
        update(ref(db, "Videos/" + currentVideo + "/Views/" + user.uid), {
            UID: user.uid
        })
    })

    // get views

    var views = 0

    get(ref(db, "Videos/" + currentVideo + "/Views")).then((snap) => {
        snap.forEach(() => {
            views += 1
        })
    }).then(() => {
        txtViews.innerText = `${views} Views`
    })

    // get likes

    var likes = 0

    get(ref(db, "Videos/" + currentVideo + "/Likes")).then((snap) => {
        snap.forEach(() => {
            likes += 1
        })
    }).then(() => {
        btnLike.innerHTML = `<img class="likedislikeButton" src="like.png" alt=""> Like (${likes})`
    })
}

function getDislikes() {
    var dislikes = 0

    get(ref(db, "Videos/" + currentVideo + "/Dislikes")).then((snap) => {
        snap.forEach(() => {
            dislikes += 1
        })
    }).then(() => {
        btnDislike.innerHTML = `<img class="likedislikeButton" src="Dislike.png" alt=""> Dislike (${dislikes})`
    })
}

signInAnonymously(auth).then(() => {
    onAuthStateChanged(auth, (user) => {
        btnLike.onclick = () => {
            get(ref(db, "Videos/" + currentVideo + "/Dislikes/" + user.uid)).then((snap) => {
                if (snap.exists()) {
                    remove(ref(db, "Videos/" + currentVideo + "/Dislikes/" + user.uid)).then(() => {
                        getDislikes()
                        getLikes()
                    })
                }
            })
            get(ref(db, "Videos/" + currentVideo + "/Likes/" + user.uid)).then((snap) => {
                if (snap.exists()) {
                    remove(ref(db, "Videos/" + currentVideo + "/Likes/" + user.uid)).then(() => {
                        getLikes()
                    })
                } else if (!snap.exists()) {
                    update(ref(db, "Videos/" + currentVideo + "/Likes/" + user.uid), {
                        UID: `${user.uid}`
                    }).then(() => {
                        getLikes()
                    })
                }
            })
        }

        btnDislike.onclick = () => {
            get(ref(db, "Videos/" + currentVideo + "/Likes/" + user.uid)).then((snap) => {
                if (snap.exists()) {
                    remove(ref(db, "Videos/" + currentVideo + "/Likes/" + user.uid)).then(() => {
                        getDislikes()
                        getLikes()
                    })
                }
            })
            get(ref(db, "Videos/" + currentVideo + "/Dislikes/" + user.uid)).then((snap) => {
                if (snap.exists()) {
                    remove(ref(db, "Videos/" + currentVideo + "/Dislikes/" + user.uid)).then(() => {
                        getDislikes()
                    })
                } else if (!snap.exists()) {
                    update(ref(db, "Videos/" + currentVideo + "/Dislikes/" + user.uid), {
                        UID: `${user.uid}`
                    }).then(() => {
                        getDislikes()
                    })
                }
            })
        }
    })
})
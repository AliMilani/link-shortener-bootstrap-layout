document.addEventListener("DOMContentLoaded", function () {
    updateRecentLinks();
});

function showAlert(form, message, type, delay = 4500) {
    let alert = form.querySelector("#shortener-form .alert");
    alert.innerHTML = message;
    alert.classList.add(type);
    alert.style.display = "block";
    setTimeout(function () {
        alert.style.display = "none";
        alert.classList.remove(type);
    }, delay);
}

function writeShortedToStorage(value) {
    let shorted = JSON.parse(localStorage.getItem("shorted"));
    if (shorted) {
        shorted.push(value);
        localStorage.setItem("shorted", JSON.stringify(shorted));
    } else {
        localStorage.setItem("shorted", JSON.stringify([value]));
    }
}

function readShortedFromStorage() {
    let shorted = JSON.parse(localStorage.getItem("shorted"));
    if (shorted) {
        return shorted;
    } else {
        return [];
    }
}

function clearStorage() {
    localStorage.clear();
}

function updateRecentLinks() {
    let shorted = readShortedFromStorage();
    console.log(shorted);
    let recentLinks = document.querySelector("#recent-links");
    console.log(shorted.length);
    shorted.length > 0
        ? (recentLinks.parentElement.style.display = "block")
        : (recentLinks.parentElement.style.display = "none");
    recentLinks.innerHTML = "";
    shorted.forEach(function (value) {
        value = JSON.parse(value);
        appendLinkToDOM(value.url, window.location.origin + "/" + value.slug);
    });
}

function appendLinkToDOM(ur, shorted) {
    let recentLinks = document.getElementById("recent-links");
    let template = `
      <div class="position-relative col  my-1 rounded-2 d-flex justify-content-between p-2">
          <p class="col-md-8 text-dark  px-2 m-0  w-40 text-truncate">${ur}</p>
          <p class="col-md-8 text-dark  px-2 m-0  w-55 me-3 text-truncate"><a href="${shorted}" target="_blank">${shorted}</a></p>
          <a class="btn  opacity-9 btn-icon-only border-2 p-0 text-2xl  position-absolute top-0 end-1"  data-bs-toggle="tooltip" data-bs-placement="right" title="Copy shorted link" onclick="copyShortdURL(this)"><i class="fa fa-copy"></i></a>
        </div>
          <!--hr class="my-2"-->
      `;
    recentLinks.insertAdjacentHTML("afterbegin", template);
}

function copyShortdURL(element) {
    element.addEventListener("click", function (event) {
        let shortedURL = event.path.find(function (element) {
            return element.tagName === "DIV";
        }).children[1].innerText;
      navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
          if (result.state == "granted" || result.state == "prompt") {
              navigator.clipboard.writeText(shortedURL);
          }
      });

      // navigator.clipboard.writeText(shortedURL);
  });
}

let shortenButtons = document.querySelectorAll(
    "#shortener-form button[type=submit]"
);
let alertMessages = {
    urlEmpty: { message: "Please enter a valid URL", type: "alert-danger" },
    urlLength: {
        message: "URL must be less than 255 characters",
        type: "alert-danger",
    },
    urlInvalid: { message: "URL must be valid", type: "alert-danger" },

    slugLong: {
        message: "Slug must be less than 100 characters",
        type: "alert-danger",
    },
    slugShort: {
        message: "Slug must be at least 3 characters",
        type: "alert-danger",
    },

    dateStartAfter: {
        message: "Start date must be before end date",
        type: "alert-danger",
    },

    dateEndBefore: {
        message: "Date must be after start date",
        type: "alert-danger",
    },

    passwordLong: {
        message: "Password must be less than 500 characters",
        type: "alert-danger",
    },

    success: {
        message: "Link successfully shortened",
        type: "alert-success",
    },
};
if (shortenButtons) {
    shortenButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            let isAdvanced =
                document.querySelector("#advanced-options").style.display === "block";

        let form = event.path.find((element) => element.tagName === "FORM");

        let url = form.querySelector("input[name=url]");
        //validate url input
        if (url.value.length === 0) {
            showAlert(
                form,
                alertMessages.urlEmpty.message,
                alertMessages.urlEmpty.type
            );
            return;
        }
        let urlRegex =
            /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
        if (url.validity.valid === false || !urlRegex.test(url.value)) {
            showAlert(
                form,
                alertMessages.urlInvalid.message,
                alertMessages.urlInvalid.type
            );
            return;
        }
        if (url.value.length > 255) {
            showAlert(
                form,
                alertMessages.urlLength.message,
                alertMessages.urlLength.type
            );
            return;
        }
        let formBody = {
            url: url.value,
            advancedSettings: {},
        };
        let slug = form.querySelector("input[name=slug]");
        let startDate = form.querySelector("input[name=start-date]");
        let endDate = form.querySelector("input[name=end-date]");
        let status301 = form.querySelector("input[id=code301]");
        let password = form.querySelector("input[name=password]");
        if (isAdvanced) {
            if (slug.value !== "") {
                if (slug.value.length > 100) {
                    showAlert(
                        form,
                        alertMessages.slugLong.message,
                        alertMessages.slugLong.type
                    );
                    return;
                }
                if (slug.value.length < 3) {
                    showAlert(
                        form,
                        alertMessages.slugShort.message,
                        alertMessages.slugShort.type
                    );
                    return;
                }
                formBody.slug = slug.value;
            }
            if (startDate.value.length > 0 && endDate.value.length > 0) {
                let startDateValue = new Date(startDate.value);
                let endDateValue = new Date(endDate.value);
                if (startDateValue > endDateValue) {
                    showAlert(
                        form,
                        alertMessages.dateStartAfter.message,
                        alertMessages.dateStartAfter.type
                    );
                    return;
                }
                if (endDateValue < startDateValue) {
                    showAlert(
                        form,
                        alertMessages.dateEndBefore.message,
                        alertMessages.dateEndBefore.type
                    );
                    return;
                }
                formBody.advancedSettings.dateStart = startDate.value;
                formBody.advancedSettings.dateEnd = endDate.value;
            }
            if (password.value.length > 0) {
                if (password.value.length > 500) {
                    showAlert(
                        form,
                        alertMessages.passwordLong.message,
                        alertMessages.passwordLong.type
                    );
                    return;
                }
            formBody.advancedSettings.password = password.value;
        }

            if (status301.checked) {
                formBody.advancedSettings.redirectCode = 301;
            }
        }
        let request = new XMLHttpRequest();
        request.open("POST", "http://127.0.0.1:3900/api/links");
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Accept", "application/json");
        request.setRequestHeader;
        request.onload = function () {
            if (request.status === 200) {
                showAlert(
                    form,
                    alertMessages.success.message,
                    alertMessages.success.type
                );
                url.value = "";
                if (isAdvanced) {
                    slug.value = "";
                    startDate.value = "";
                    endDate.value = "";
                    password.value = "";
                }
                writeShortedToStorage(request.response);
                console.log(JSON.parse(request.response));
                updateRecentLinks();
            } else {
                showAlert(
                    form,
                    `Error: ${request.responseText} (Code: ${request.status})`,
                    "alert-danger"
                );
            }
        };
        request.send(JSON.stringify(formBody));
    });
  });
}

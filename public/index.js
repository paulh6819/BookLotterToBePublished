//import { download } from "express/lib/response";

let image = {
  url: null,
  message: "Let's see what these books are worth",
};

const resultsContainer = document.getElementById("result-container");
const fetchBookDataButton = document.getElementById(
  "div-for-button-to-fetch-bookdata"
);
// console.log("hey");
let isbnData;
let imagesToBeDisplayedInTheUi = "";
let formData = new FormData();
let count = 0;
let userInput = "";
let singleBookToggled = false;

async function handleDrop(event) {
  event.preventDefault();
  // Scrolls down 100px immediately when this code runs
  window.scrollBy({
    top: 300, // Vertical scroll amount in pixels
    left: 0, // Horizontal scroll amount (not needed here)
    behavior: "smooth", // Optional: defines the transition animation
  });
  window.scrollBy({
    top: 300, // Vertical scroll amount in pixels
    left: 0, // Horizontal scroll amount (not needed here)
    behavior: "smooth", // Optional: defines the transition animation
  });

  const file = event.dataTransfer.files;

  console.log("Dropped file:", file);

  //below is the way I used to hide the arrow animation - keeping it incase I need to use it again tio hide the

  // const elementToHide = document.querySelector(".arrow");

  // elementToHide.style.display = "none";

  const imageArray = [];

  for (let i = 0; i < file.length; i++) {
    if (file[i].type.match(/^image\//)) {
      console.log("Dropped file:", file[i]);
      formData.append("images[]", file[i]);
      imageArray.push(file[i]);
    }
  }

  updateImage(imageArray);
  function updateImage(imageArray) {
    count++;

    for (let image of imageArray) {
      const img = document.createElement("img");
      // const imgDiv = document.getElementsByClassName("image-dropped-in-url");
      // console.log((count += 1));
      console.log("this is the image count on the cloud", count);
      img.src = URL.createObjectURL(image);
      img.height = 10;
      img.onload = function () {
        URL.revokeObjectURL(this.src);
      };
      imagesToBeDisplayedInTheUi += `<div class="image-dropped-in" >
<img class="image-dropped-in-url" src="${URL.createObjectURL(
        image
      )}" alt="image">
</div>
`;
    }
    document.getElementById("display-dropped-photos").innerHTML =
      imagesToBeDisplayedInTheUi;
  }

  if (formData.has("images[]")) {
    // updateImage(URL.createObjectURL(file[0]));

    // formData.append("image", file)
    console.log("this is the  new new form data", formData);
    console.log("this is the form data", formData.entries());

    console.log("this is the form data size", formData.size);

    document.getElementById("div-for-button-to-fetch-bookdata").style.display =
      "block";

    document.getElementById("upload-button-id").style.display = "none";

    //making sure multiple event listeners are not added to the button and that the fetch is not unneccessarily called
    if (count === 1) {
      fetchBookDataButton.addEventListener("click", fetchBookData);
      console.log("added fetch book data event listener");
    }

    async function fetchBookData() {
      if (userInput) {
        formData.append("userInput", userInput);
      }

      for (var pair of formData.entries()) {
        if (pair[1] instanceof File) {
          // Log details of the file
          console.log(
            "File details - Name:",
            pair[1].name,
            "Size:",
            pair[1].size,
            "Type:",
            pair[1].type
          );
        } else {
          // Log other form data entries
          console.log("Form data entry:", pair[0] + ": " + pair[1]);
        }
      }
      console.log("we are in the fetch book data button");

      showHamsterAndDimBackground();

      let endPoint = singleBookToggled ? "/detectSingleBook" : "/detectLabels";
      console.log("endPoint", endPoint);

      let response = await fetch(endPoint, {
        method: "POST",
        body: formData,
      });
      console.log("response data form backend: ", response);
      if (response.ok) {
        try {
          const {
            result,
            // bookUrls,
            // mappedImageAndSummary,
            // pricePlaceHolder,
            // arrayOfISBNs,
          } = await response.json();
          console.log("This is my main object", result);

          const resultContainer = document.getElementById("result-container");

          if (result) {
            resultContainer.style.display = "block";
            resultContainer.innerHTML = ` <div class="top-part">
              <button class="copy-button" onclick="copyText()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                      <path d="M10.5 1a.5.5 0 0 1 .5.5V2h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1v-.5a.5.5 0 0 1 .5-.5h5zm0 1h-5a.5.5 0 0 0-.5.5V3h6v-.5a.5.5 0 0 0-.5-.5zM5 4V2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V4H5z"/>
                  </svg>
              </button>
          </div>
          <div class="content-part">
             ${result}
          </div>`;

            result;
          } else {
            resultContainer.innerHTML = "No results found";
            console.log("No results found");
          }
        } catch (error) {
          console.error("Error processing OCR data", error);
        }

        hideHamsterAndRemoveDim();
        function removeImages() {
          document.getElementById("display-dropped-photos").innerHTML = "";
        }
        removeImages();
        imagesToBeDisplayedInTheUi = "";
        formData = new FormData();

        // console.log("trying to get URLS here", bookUrls);
        // console.log("here are the mapped images", mappedImageAndSummary);
        // console.log(
        //   "here are the summarya",
        //   mappedImageAndSummary?.[0]?.summary ??
        //     "No summary availibe unfortunately"
        // );
        // console.log("this is the place holder", pricePlaceHolder);
        // console.log("these are the ISBNS", arrayOfISBNs);
        //console.log("this is ISBN", mappedImageAndSummary[0].ISBN[0].type);
        // isbnData = arrayOfISBNs;
        // console.log(isbnData);
        showCSVButtonAfterPhotoIsDroppedAndThereIsData();

        //   const summaryElememnt = document.createElement("p");
        //   const imgElement = document.createElement("img"); // Create an actual img element
        //   imgElement.src = result.imageUrl; // Set the source of the image element
        //   summaryElememnt.style.margin = "0px";
        //   summaryElememnt.style.marginLeft = "0px";
        //   summaryElememnt.style.marginTop = "28px";
        //   summaryElememnt.style.textAlign = "left";
        //   summaryElememnt.style.marginRight = "25px";
        //   summaryElememnt.style.marginBottom = "22px";

        //   summaryElememnt.style.textAlign = "left";

        //   imgElement.alt = ` `;
        //   imgElement.classList.add("book-container-img");

        //   closeButton.style.fontSize = "20px";
        //   closeButton.style.fontWeight = "bold";

        //   closeButton.style.borderRadius = "4px";

        //   // Append close button to the bookContainer
        //   bookItem.appendChild(bookContainer);
        //   bookItem.appendChild(closeButton);

        //   document.getElementById("result-container").appendChild(bookItem);

        //   closeButton.addEventListener("click", function () {
        //     // Apply fade-out effect before removal
        //     bookItem.style.opacity = "0";
        //     bookItem.addEventListener("transitionend", () => bookItem.remove(), {
        //       once: true,
        //     });
        //   });

        //   // Use the setup function to associate the closeButton with the bookContainer
        // });

        //below is the code for showing all the book covers

        // bookUrls.forEach((url) => {
        //   const imgElemnt = document.createElement("img");
        //   imgElemnt.src = url;
        //   imgElemnt.alt = "Book Cover";
        //   imgElemnt.style.width = "100px";
        //   imgElemnt.style.height = "auto";

        //   resultsContainer.appendChild(imgElemnt);
        // });

        // result.forEach((bookrunItem) => {
        //   const dataLine = document.createElement("div");
        //   const prices =
        //     typeof bookrunItem[2] === "string"
        //       ? "Book has no value"
        //       : `Value is ${bookrunItem[2].Good}`;
        //   dataLine.innerText = `Name: ${bookrunItem[0]}, ISBN: ${bookrunItem[1]}, ${prices}`;
        //   resultsContainer.appendChild(dataLine);
        // });

        // isbToPriceMapDisplay(isbToPriceMap ?? {});
      } else {
        console.log("failed to process image of OCR");
        alert(
          "Failed to process the OCR image. The page will refresh for another attempt."
        );
        // Refresh the page to allow the user to try again
        window.location.reload();
      }
    }
  } else {
    alert("Invalid file type. Please drop an image file.");
  }

  // function fetchFileData() {
  //   //If I go back to my pupeteer code I will have to make maxAttempts go back to 1000.
  //   const maxAttempts = 1;
  //   let attempts = 0;

  //   function attemptFetch() {
  //     fetch("/getMostRecentFile")
  //       .then((response) => {
  //         if (!response.ok) {
  //           throw new Error("No file found");
  //         }
  //         return response.json();
  //       })
  //       .then(async (data) => {
  //         // console.log(
  //         //   "File data from the front end containing the CSV file:",
  //         //   // JSON.stringify(data.file.data)
  //         //   data
  //         // );
  //         displayFileData(data.file);
  //       })
  //       .catch((error) => {
  //         if (attempts++ < maxAttempts) {
  //           setTimeout(attemptFetch, 3000); // Wait for 2 seconds before trying again
  //         } else {
  //           console.error(
  //             "Error fetching file after multiple attempts:",
  //             error
  //           );
  //         }
  //       });
  //   }

  //   attemptFetch();
  // }

  // fetchFileData();
}

function isbToPriceMapDisplay(map) {
  const container = document.getElementById("isbnPriceContainer");
  container.innerHTML = "";

  for (const [isbn, price] of Object.entries(map)) {
    const item = document.createElement("div");
    item.innerText = `ISBN: ${isbn}, Price: ${price}`;
    container.appendChild(item);
  }
}

function handleDragOver(event) {
  event.preventDefault();
}

// function updateImage(imageArray) {
//   // image.url = url;
//   // document.getElementById("droppedImage").src = url;
//   // document.getElementById("imageMessage").innerText = image.message;
//   // document.getElementById("imagePreview").style.display = "block";

//   for (let image of imageArray) {
//     const img = document.createElement("img");
//     img.src = URL.createObjectURL(image);
//     img.height = 60;
//     img.onload = function () {
//       URL.revokeObjectURL(this.src);
//     };
//     document.getElementById("imagePreview").appendChild(img);
//   }
// }

function toHTML(s) {
  return document.createRange().createContextualFragment(s);
}

function showHamsterAndDimBackground() {
  document.querySelector(".wheel-and-hamster").style.display = "block";
  // const loadingElement = document.createElement("h1");
  // loadingElement.innerHTML = "LOADING";
  // document.body.appendChild(loadingElement);
  document.querySelector(".dim-background").style.display = "block";
}

function hideHamsterAndRemoveDim() {
  document.querySelector(".wheel-and-hamster").style.display = "none";
  document.querySelector(".dim-background").style.display = "none";
}

function showCSVButtonAfterPhotoIsDroppedAndThereIsData() {
  document.getElementById("downloadButton").style.display = "block";
}

//below is my function for uploading a file

async function handleFileSelect(event) {
  const file = event.target.files[0];
  // console.log("Selected file:", file);
  showHamsterAndDimBackground();
  const elementToHide = document.querySelector(".arrow");
  // elementToHide.style.display = "none";

  if (file && file.type.match(/^image\//)) {
    updateImage(URL.createObjectURL(file));

    let formData = new FormData();
    formData.append("image", file);

    let response = await fetch("/detectLabels", {
      method: "POST",
      body: formData,
    });
    console.log("response data form backend: ", response);

    if (response.ok) {
      const {
        result,
        // bookUrls,
        // mappedImageAndSummary,
        // pricePlaceHolder,
        // arrayOfISBNs,
      } = await response.json();
      // console.log("This is my main object", result);
      // console.log("trying to get URLS here", bookUrls);
      // console.log("here are the mapped images", mappedImageAndSummary);
      // console.log(
      //   "here are the summarya",
      //   mappedImageAndSummary?.[0]?.summary ??
      //     "No summary availibe unfortunately"
      // );
      // console.log("this is the place holder", pricePlaceHolder);
      // console.log("these are the ISBNS", arrayOfISBNs);
      //console.log("this is ISBN", mappedImageAndSummary[0].ISBN[0].type);
      // isbnData = arrayOfISBNs;
      // console.log(isbnData);
      hideHamsterAndRemoveDim();
      showCSVButtonAfterPhotoIsDroppedAndThereIsData();
      mappedImageAndSummary.forEach((result) => {
        const bookContainer = document.createElement("div");
        bookContainer.className = "book-container";
        // bookContainer.style.border = "1px solid black";
        bookContainer.className = "book-container";

        // This creates the title for the book in the UI
        const bookTitle = document.createElement("h2");
        bookTitle.innerHTML = result.title;
        bookTitle.style.textAlign = "left";
        bookTitle.style.backgroundColor = "red";
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = result.title;
        details.appendChild(summary);

        let authorsElement = document.createElement("p");
        authorsElement.innerHTML = `<span class="label"> Author: </span> ${
          result?.author?.[0] ?? ""
        }`;
        authorsElement.style.textAlign = "left";

        let publisherElemnt = document.createElement("p");
        publisherElemnt.style.textAlign = "left";
        publisherElemnt.style.marginBottom = "7px";
        publisherElemnt.innerHTML = `<span class="label">Publisher:</span> ${
          result?.publisher ?? ""
        }`;

        let ISBNElemnet = document.createElement("p");
        ISBNElemnet.innerHTML = `<span class="label">ISBN number:</span> ${
          result.ISBN?.[0]?.identifier ?? ""
        }`;
        ISBNElemnet.style.textAlign = "left";
        ISBNElemnet.style.margin = "0px";

        const summaryElememnt = document.createElement("p");
        const imgElement = document.createElement("img"); // Create an actual img element
        imgElement.src = result.imageUrl; // Set the source of the image element
        summaryElememnt.style.margin = "0px";
        summaryElememnt.style.marginLeft = "0px";
        summaryElememnt.style.top = "28px";
        summaryElememnt.style.textAlign = "left";

        imgElement.alt = ` `;
        imgElement.classList.add("book-container-img");
        // imgElement.style.width = "100px";
        // imgElement.style.height = "auto";

        summaryElememnt.innerHTML = result.summary;
        // const test = toHTML(
        //   `<div>
        //      <dl>
        //         <dt class= "title"> Title </dt>  <dd> ${result.title} </dd>

        //           <dt> ISBN </dt>
        //           <dd> ${result.ISBN[0].identifier} </dd>
        //     </dl>
        //        <p>
        //           <a href="https://developer.mozilla.org/en-US/docs/Web/API/range/createContextualFragment">
        //               Hello <strong>World!</strong>
        //           </a>
        //        </p>

        //   </div>`
        // );
        if (result.rating) {
          let ratingElement = document.createElement("p");
          ratingElement.innerHTML = `<span class="label">Rating:</span> ${result.rating}`;
          details.appendChild(ratingElement);
          ratingElement.style.textAlign = "left";
        }
        details.appendChild(authorsElement);

        details.appendChild(publisherElemnt);
        details.appendChild(ISBNElemnet);
        details.appendChild(summaryElememnt);

        bookContainer.appendChild(imgElement);
        // bookContainer.appendChild(bookTitle);
        // bookContainer.appendChild(summaryElememnt);
        // bookContainer.appendChild(authorsElement);
        // bookContainer.appendChild(publisherElemnt);
        // bookContainer.appendChild(ISBNElemnet);

        bookContainer.appendChild(details);
        // bookContainer.appendChild(test);

        resultsContainer.appendChild(bookContainer);

        details.addEventListener("toggle", (event) => {
          if (event.newState === "open") {
            imgElement.classList.add("details-open");
          } else {
            imgElement.classList.remove("details-open");
          }
        });
      });

      //below is the code for showing all the book covers

      // bookUrls.forEach((url) => {
      //   const imgElemnt = document.createElement("img");
      //   imgElemnt.src = url;
      //   imgElemnt.alt = "Book Cover";
      //   imgElemnt.style.width = "100px";
      //   imgElemnt.style.height = "auto";

      //   resultsContainer.appendChild(imgElemnt);
      // });

      result.forEach((bookrunItem) => {
        const dataLine = document.createElement("div");
        const prices =
          typeof bookrunItem[2] === "string"
            ? "Book has no value"
            : `Value is ${bookrunItem[2].Good}`;
        dataLine.innerText = `Name: ${bookrunItem[0]}, ISBN: ${bookrunItem[1]}, ${prices}`;
        resultsContainer.appendChild(dataLine);
      });

      // isbToPriceMapDisplay(isbToPriceMap ?? {});
    } else {
      console.log("failed to process image of OCR");
    }

    //processFile(file);
  } else {
    alert(
      "Invalid file type. Please select an image file so we can see those books."
    );
  }
}

//below is the code for drag hover effect for the upload section

document.addEventListener("DOMContentLoaded", function () {
  // Other initialization code here

  const dropArea = document.getElementById("drop-area-javascript");

  // Set up drag and drop listeners
  dropArea.addEventListener("dragenter", function (event) {
    dropArea.classList.add("drag-hover");
  });

  dropArea.addEventListener("dragleave", function (event) {
    dropArea.classList.remove("drag-hover");
  });

  dropArea.addEventListener("drop", function (event) {
    // Handle the drop event
    dropArea.classList.remove("drag-hover");
    // ... other drop handling code ...
  });

  // Any other code that needs to run after the DOM is fully loaded
});
document
  .getElementById("descriptionForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevents the form from reloading the page

    userInput = document.getElementById("userInput").value;

    // Here you can send userInput to ChatGPT's API as part of the request payload
    console.log(`User wants to include: ${userInput}`);
  });

document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggleButton");

  toggleButton.addEventListener("click", function () {
    if (toggleButton.classList.contains("unchecked")) {
      toggleButton.classList.remove("unchecked");
      toggleButton.classList.add("checked");
      console.log("Button is checked");
    } else {
      toggleButton.classList.remove("checked");
      toggleButton.classList.add("unchecked");
      console.log("Button is unchecked");
    }
  });
  const singleBookButtonToggle = document.getElementById("singleBookToggle");
  singleBookButtonToggle.addEventListener("click", function () {
    if (singleBookButtonToggle.classList.contains("unchecked")) {
      singleBookButtonToggle.classList.remove("unchecked");
      singleBookButtonToggle.classList.add("checked");
      console.log("Button is checked");
      singleBookToggled = true;
    } else {
      singleBookButtonToggle.classList.remove("checked");
      singleBookButtonToggle.classList.add("unchecked");
      console.log("Button is unchecked");
      singleBookToggled = false;
    }
  });
});

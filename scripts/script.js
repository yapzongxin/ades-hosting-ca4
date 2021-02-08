let formCount = 0;
var intervalArr = [];

async function myRequest(url) {
  const host = "https://ades-2b03.herokuapp.com";
  try {
    return await axios.get(host + url);
  } catch (err) {
    alert("error");
    // console.log(err);
  }
}

function getQueue2() {
  console.log(formCount++);
  const d = $(`<div id='form` + formCount + `'>`);
  d.addClass("col");
  d.html(
    `<form class="my-3 p-4" id='form-layout` +
      formCount +
      `'>
            <div class="form-container">
                <div class="form-row" style="display: flex; justify-content: flex-end">
                    <button type="button" onclick="closeButton(` +
      formCount +
      `)" class="btn cancel" style="display: flex; border: none; background-color: white; float: right"><i class="fa fa-close"></i></button>
                </div>
                <div class="form-group row">
                    <label for="companyID" class="col-3 col-form-label">Company ID</label>
                    
                    <div class="col-4">
                        <input type="text" class="py-1 px-0" name="companyid" id="companyid` +
      formCount +
      `"  />
                        <input type="hidden" value='` +
      formCount +
      `' id="trackerid` +
      formCount +
      `">
                    </div>
                    <div class="col-3">
                        <button id="submitBtn" class="py-1" type="button" onclick="validateForm(` +
      formCount +
      `)"  name="submit">Submit</button>
                    </div>
                    <div class="col-2">
                      <div class="spinner-border text-info" role="status" style="display: none; height: 30px; width: 30px; margin-bottom: 1px;" id="loader` +
      formCount +
      `"></div>
                    </div>
                </div>
                <div class="row">
                  <div class="offset-3 col-4" style="color: red;">
                    <p name="demo" id="demo` +
      formCount +
      `"></p>
                  </div>
                </div>
                
                <div class="form-group row mb-4">
                    <label for="queueID" class="col-3 col-form-label">Queue ID</label>
                    <div class="col-4">
                        <select name="queueid" id="selection` +
      formCount +
      `" onchange="arrivalRate(` +
      formCount +
      `)" >
                            <option value="empty"></option>
                        </select>
                    </div>
                    <div class="col-5">
                        <div class="inactive-row">
                            <input type="checkbox" id="cb` +
      formCount +
      `" name="cb` +
      formCount +
      `" onChange="searchBtn(` +
      formCount +
      `)" checked/>
                            <label for="cb">Hide Inactive</label>
                        </div>
                    </div>
                </div>
                </div>
                <div class="chartDiv" id="addChart` +
      formCount +
      `"></div>
            </div>
        </form>`
  );
  $("#track").append(d);
}

function closeButton(i) {
  $("#form" + i).remove();
  $(`#err` + i).remove();
  var int = intervalArr[i];
  clearInterval(int);
}

function searchBtn(i) {
  const trackerid = document.getElementById("trackerid" + i).value;
  const id = document.getElementById("companyid" + trackerid).value;
  const cb = document.getElementById("cb" + i);
  var ind = i;
  document.getElementById("loader" + trackerid).style.display = "block";

  $(`#selection` + trackerid).empty();

  clearInterval(intervalArr[i]);
  $("#myChart" + i).remove();

  if (id != "") {
    myRequest(`/company/queue?company_id=${id}`)
      .then((success) => {
        if (success.data.length == 0) {
          $(`#demo` + ind).append(
            `<a id='err` +
              ind +
              `'><b>Company ` +
              id +
              ` does not have queues.</b></a>`
          );
        } else if (cb.checked == true) {
          $(`#selection` + trackerid).append(
            `<option id='optionsid` +
              trackerid +
              `' value='empty'>-- Select An Option --</option>`
          );
          for (var i = 0; i < success.data.length; i++) {
            const status = `${success.data[i].is_active}`;
            console.log(status);
            if (status == 1) {
              const postHtml = `${success.data[i].queue_id}`;
              var optionHTML =
                `<option id='optionsid` +
                trackerid +
                `' value='` +
                postHtml +
                `'>` +
                postHtml +
                `</option>`;
              $(`#selection` + trackerid).append(optionHTML);
            }
          }
        } else {
          for (var i = 0; i < success.data.length; i++) {
            const postHtml = `${success.data[i].queue_id}`;
            if (success.data[i].is_active == 0) {
              var optionHTML =
                `<option id='optionsid` +
                trackerid +
                `' value='inactive'>` +
                postHtml +
                " (inactive)" +
                `</option>`;
            } else {
              var optionHTML =
                `<option id='optionsid` +
                trackerid +
                `' value='` +
                postHtml +
                `'>` +
                postHtml +
                `</option>`;
            }

            $(`#selection` + trackerid).append(optionHTML);
          }
        }
      })
      .finally(() => {
        document.getElementById("loader" + trackerid).style.display = "none";
      });
  }
}

function arrivalRate(i) {
  var interval;
  const trackerid = document.getElementById("trackerid" + i).value;
  const queueid = document.getElementById("selection" + i).value;
  var labels = [0, 0, 0, 0, 0];
  var dataset = new Array(5);

  var updateChart = function updateChart() {
    document.getElementById("loader" + trackerid).style.display = "block";
    var m = moment().add(-30, "s");
    console.log(
      `http://localhost:8080/company/arrival_rate?queue_id=${queueid}&from=${m.toISOString(
        m
      )}&duration=1`
    );
    myRequest(
      `/company/arrival_rate?queue_id=${queueid}&from=${m.toISOString(
        m
      )}&duration=1`
    )
      .then((success) => {
        var timestamp = success.data[0].timestamp;
        var count = success.data[0].count;

        massPopChart.data.datasets[0].data.shift();
        massPopChart.data.datasets[0].data.push(count);

        massPopChart.data.labels.shift();
        massPopChart.data.labels.push(timestamp);
        massPopChart.update();
      })
      .finally(() => {
        document.getElementById("loader" + trackerid).style.display = "none";
      });
  };

  //delete existing chart
  clearInterval(intervalArr[i]);
  $("#myChart" + i).remove();

  if (queueid == "empty") {
    $(`#demo` + i).append(
      `<a id='err` +
        i +
        ` style="color: red;'><b>Please select a valid queue.</b></a>`
    );
  } else if (queueid == "inactive") {
    $(`#demo` + i).append(
      `<a id='err` + i + `' style="color: red;"><b>Queue is inactive.</b></a>`
    );
  } else {
    text = "";
    document.getElementById("demo" + trackerid).innerHTML = text;

    //create and add new canvas
    $("#addChart" + i).append(`<canvas id="myChart` + i + `"></canvas>`);
    //get chart
    var myChart = document
      .getElementById("myChart" + trackerid)
      .getContext("2d");
    var massPopChart = new Chart(myChart, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Count",
            data: dataset,
            backgroundColor: "rgb(53, 187, 196)",
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: "Queue ID: " + queueid,
        },
        legend: {
          display: "false",
        },
      },
    });

    interval = setInterval(updateChart, 3000);
    intervalArr[i] = interval;
  }
}

//validation
function validateForm(i) {
  var text;
  const trackerid = document.getElementById("trackerid" + i).value;
  const companyid = document.getElementById("companyid" + trackerid).value;

  if (companyid == "") {
    // console.log("Company Id must be filled out.");
    text = "Company Id must be filled out.";
  } else if (companyid < 1000000000 || companyid > 9999999999) {
    text = "Company Id must be 10 digits.";
  } else if (isNaN(companyid)) {
    text = "Invalid Company ID (only digits allowed).";
    // alert("Failed to fetch");
  } else {
    text = "";
    document.getElementById("demo" + trackerid).innerHTML = text;
    return searchBtn(i);
  }
  document.getElementById("demo" + trackerid).innerHTML = text;
}

function hideSpinner(i) {
  const trackerid = document.getElementById("trackerid" + i).value;
  document.getElementById("loader" + trackerid).style.display = "none";
}

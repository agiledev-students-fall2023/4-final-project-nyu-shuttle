const express = require("express");
const { google } = require("googleapis");
const RouteAWeek = require("../models/RouteAWeek.js"); 

const timetableRouter = () => {
  const router = express.Router();

  router.get("/loadroutes", async (req, res) => {
    const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
    const spreadsheetId = "1jlRme7S0vBssLcbZlQTjP5QrHtV0Cj02jMydXN_7E2I";

    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: SCOPES,
      });

      const client = await auth.getClient();
      const googleSheets = google.sheets({ version: "v4", auth: client });

      const getRows = await googleSheets.spreadsheets.values.get({
        auth: client,
        spreadsheetId,
        range: "Monday - Thursday",
      });

      const sheetData = getRows.data.values;
      let stop_name = null;
      let timestamp = null;
      let times = [];
      if (sheetData.length > 0) {
        for (let j = 0; j < sheetData[3].length; j++) {
          for (let i = 0; i < sheetData.length; i++) {
            const cellValue = sheetData[i][j];
            if (i === 2) {
              stop_name = cellValue;
              console.log(stop_name)
            } else if(i > 2){
              if(cellValue){
                times.push(cellValue);
              }
            }
          }
          timestamp = Date.now();
          if(times.length != 0 || stop_name != null){ 
            const newRouteAWeek = new RouteAWeek({ stop_name, timestamp, times }).save(); 
          }
        }
      } else {
        console.log("No data found.");
      }

      return res.json({
        success: true,
        message: "Feedback retrieved successfully.",
        stop_name,
        timestamp,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error looking up feedback in the database.",
        error: error.message,
      });
    }
  });

  return router;
};

module.exports = timetableRouter;

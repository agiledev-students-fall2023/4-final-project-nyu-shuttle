const express = require("express");
const { google } = require("googleapis");
const RouteAWeek = require("../models/RouteAWeek.js"); 
const RouteAFri = require("../models/RouteAFri.js");
const RouteAWknd = require("../models/RouteAWknd.js");
const RouteBWeek = require("../models/RouteBWeek.js");
const RouteBFri = require("../models/RouteBFri.js");
const RouteCWeek = require("../models/RouteCWeek.js")
const RouteEWeek = require("../models/RouteEWeek.js")
const RouteEFri = require("../models/RouteEFri.js") 
const RouteFWeek = require("../models/RouteFWeek.js");
const RouteGWeek = require("../models/RouteGWeek.js");
const RouteGFri = require("../models/RouteGFri.js");
const RouteGWknd = require("../models/RouteGWknd.js");
const RouteWWknd = require("../models/RouteWWknd.js");

const timetableRouter = () => {
  const router = express.Router();

  const processSheetData = async (spreadsheetId, range, Schema) => {
    const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
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
        range,
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
            } else if (i > 2) {
              if (cellValue && cellValue.trim() != "-" && (cellValue.includes("AM") || cellValue.includes("PM"))) {
                times.push(cellValue);
              }
            }
          }
          timestamp = Date.now();
          if (times.length !== 0 || stop_name !== null) {
            const existingEntry = await Schema.findOneAndUpdate(
              { stop_name},
              { $set: { times, timestamp} },
              { upsert: true, new: true }
            );
            if (!existingEntry) {
              const newRoute = new Schema({
                stop_name,
                timestamp,
                times,
              }).save();
            }
          }
          times = [];
        }
      } else {
        console.log("No data found.");
      }
    } catch (error) {
      console.error(error);
    }
  };



  router.get("/routesA_W", async (req, res) => {
    const spreadsheetId_AW = "1jlRme7S0vBssLcbZlQTjP5QrHtV0Cj02jMydXN_7E2I";
    const range_AW = "Monday - Thursday";
    try{
      await processSheetData(spreadsheetId_AW, range_AW, RouteAWeek);
      return res.json({
        success: true,
        message: "Routes updated successfully.",
      }); 
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error loading into database",
        error: error,
      });
    }
  });

  router.get("/routesA_F", async (req, res) => {
    const spreadsheetId_AF = "1K3P2W9DLbVoe8b6p-ZApdBU9vlvZnGYdp6NvETO6FvA";
    const range_AF = "Friday";
    try{
      await processSheetData(spreadsheetId_AF, range_AF, RouteAFri);
      return res.json({
        success: true,
        message: "Routes updated successfully.",
      }); 
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error loading into database.",
        error: error,
      });
    }
  });

  router.get("/routesA_Wknd", async (req, res) => {
    const spreadsheetId_AWknd = "10wPPDsXBkyeVqvQVrBO7rqN-ERzOucR0hAWzA7N1nCU";
    const range_AWknd = "Weekend";
    try{
      await processSheetData(spreadsheetId_AWknd, range_AWknd, RouteAWknd);
      return res.json({
        success: true,
        message: "Routes updated successfully.",
      }); 
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error loading into database",
        error: error,
      });
    }
  });

  router.get("/routesB_W", async (req, res) => {
    const spreadsheetId_BW = "1RFcpF009PyBT-E-FlfidOWe0Zi5n2mVD-dk988QiSoM";
    const range_BW = "Mon-Thurs";
    try{
      await processSheetData(spreadsheetId_BW, range_BW, RouteBWeek);
      return res.json({
        success: true,
        message: "Routes updated successfully.",
      }); 
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error loading into database.",
        error: error,
      });
    }
  });
  
  router.get("/routesB_F", async (req, res) => {
    const spreadsheetId_BF = "1d7qcHrb5-Wm_ozU2QHnFgnyrmG9g3JosG-T6pe1sf6g";
    const range_BF = "Fri";
    try{
      await processSheetData(spreadsheetId_BF, range_BF, RouteBFri);
      return res.json({
        success: true,
        message: "Routes updated successfully.",
      }); 
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error loading into database.",
        error: error,
      });
    }
  });

  router.get("/routesC_W", async (req, res) => {
    const spreadsheetId_CW = "1sI19tog5q2HvD62v8WK5mbz8gC4mPqxLwsLPDkcGgj4";
    const range_CW = "Mon-Thurs";
    try{
      await processSheetData(spreadsheetId_CW, range_CW, RouteCWeek);
      return res.json({
        success: true,
        message: "Routes updated successfully.",
      }); 
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: " Error loading into database.",
        error: error,
      });
    }
  });

  router.get("/routesE_W", async (req, res) => {
    const spreadsheetId_EW = "1shK20dC2NbZu87IAejKz6AG3Bylm8DUKZjoqBIUsipQ";
    const range_EW = "Mon-Thurs";
    try{
      await processSheetData(spreadsheetId_EW, range_EW, RouteEWeek);
      return res.json({
        success: true,
        message: "Routes updated successfully.",
      }); 
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error loading into database.",
        error: error,
      });
    }
  });

  router.get("/routesE_F", async (req, res) => {
    const spreadsheetId_EF = "1a-heAL-fVzz7VQN_Fyn1kTH4SrKqiziXa4lnXpBGOSU";
    const range_EF = "Fri";
    try{
      await processSheetData(spreadsheetId_EF, range_EF, RouteEFri);
      return res.json({
        success: true,
        message: "Routes updated successfully.",
      }); 
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error loading into database.",
        error: error,
      });
    }
  });

  router.get("/routesF_W", async (req, res) => {
    const spreadsheetId_FW = "17gwe1E9PG4UuvL8boBFrmZKo-fmi7js-3CBF771CYSk";
    const range_FW = "Mon-Thurs";
    try{
      await processSheetData(spreadsheetId_FW, range_FW, RouteFWeek);
      return res.json({
        success: true,
        message: "Routes updated successfully.",
      }); 
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error loading into database.",
        error: error,
      });
    }
  });

  router.get("/routesG_W", async (req, res) => {
    const spreadsheetId_GW = "1q-QoF3s9OKUxNKcApknQJdRlGHC6GS4JwaMgwB-_xjY";
    const range_GW = "Mon-Thurs";
    try{
      await processSheetData(spreadsheetId_GW, range_GW, RouteGWeek);
      return res.json({
        success: true,
        message: "Routes updated successfully.",
      }); 
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error loading into database.",
        error: error,
      });
    }
  });

  router.get("/routesG_F", async (req, res) => {
    const spreadsheetId_GF = "1IvXUVUMWSE2NC64DsOOhvzNy6PDkZWI5cqBo0BHru44";
    const range_GF = "Fri";
    try{
      await processSheetData(spreadsheetId_GF, range_GF, RouteGFri);
      return res.json({
        success: true,
        message: "Routes updated successfully.",
      }); 
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Error loading into database.",
        error: error,
      }); 
    }
  });

  router.get("/routesG_Wknd", async (req, res) => {
    const spreadsheetId_GWknd = "1eGuv3KlOsh0QkoZnMXHCdmsxVMb9LLRKUgauiNVVTZY";
    const range_GWknd = "Weekend";
    try{
      await processSheetData(spreadsheetId_GWknd, range_GWknd, RouteGWknd);
      return res.json({
        success: true,
        message: "Routes updated successfully.",
      }); 
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Error loading into database.",
        error: error,
      }); 
    }
  });
    
  router.get("/routesW_Wknd", async (req, res) => {
    const spreadsheetId_WWknd = "1ri820ZdZNSj0nxnaCfzaczsjY0ALORGRMnUXt23QMNE";
    const range_WWknd = "Weekend";
    try{
      await processSheetData(spreadsheetId_WWknd, range_WWknd, RouteWWknd);
      return res.json({
        success: true,
        message: "Routes updated successfully.",
      }); 
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Error loading into database.",
        error: error,
      }); 
    }
  });
  

  return router;
};

module.exports = timetableRouter;

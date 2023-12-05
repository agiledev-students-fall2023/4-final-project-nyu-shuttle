const express = require("express");
const mongoose = require('mongoose');

const stopRoutes = () => {
    const router = express.Router();
    
    const getDayOfWeek = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        console.log(dayOfWeek);
        return dayOfWeek;
    }

    const routeRuns = (route_name, day_of_week) => {
        if (
            (route_name === "B" && (day_of_week === 0 || day_of_week === 6)) ||
            (route_name === "C" && (day_of_week === 0 || day_of_week === 6 || day_of_week === 5)) ||
            (route_name === "E" && (day_of_week === 0 || day_of_week === 6)) ||
            (route_name === "F" && (day_of_week === 0 || day_of_week === 6 || day_of_week === 5)) ||
            (route_name === "W" && (day_of_week !== 0 && day_of_week !== 6))
        ) {
            return false;
        } else {
            return true;
        }
    }

    const dayToString = (day_of_week) => {
        if (day_of_week === 0 || day_of_week === 6) {
            return "Wknd";
        } else if (day_of_week === 5) {
            return "F";
        } else {
            return "Week";
        }
    }

    router.get("/:stop_name/:route_name", async (req, res, next) => {
        const day_of_week = getDayOfWeek();
        console.log(day_of_week);
        const { stop_name, route_name } = req.params;
        console.log(stop_name, route_name, "rpint");
        const runs = routeRuns(route_name, day_of_week);

        if (!stop_name || !route_name) {
            return res.status(401).json({
                success: false,
                message: "Invalid request. Please provide all required fields.",
            });
        } 
        if (!runs) {
            return res.status(200).json({
                success: true,
                message: "Route is not running today.",
            });
        }
        try {
            const StopModel = mongoose.model('Route' + route_name + dayToString(day_of_week));
            const stop = await StopModel.findOne({ stop_name: { $regex: new RegExp(stop_name, 'i') } });
            if (!stop) {
                console.log("Invalid request. Cannot find stop.")
                return res.status(404).json({
                    success: false,
                    message: "Stop not found.",
                });
            }
            return res.json({
                success: true,
                message: "Stop found.",
                stop,
            });
        } catch (err) {
            console.log("Invalid request. Please provide all required fields.")
            console.error(`Error fetching stop: ${err}`);
            return res.status(500).json({
                success: false,
                message: "Error looking up stop in the database.",
                error: err,
            });
        }
    });

    return router;
}

module.exports = stopRoutes;

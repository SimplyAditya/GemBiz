"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
dotenv_1.default.config();
const supabaseUrl = process.env.PROJECT_URL || "";
const supabaseKey = process.env.API_KEY || "";
exports.db = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
//# sourceMappingURL=db.js.map
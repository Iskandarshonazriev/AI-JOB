import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const axiosRequest = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } });

axiosRequest.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const fetchOrgProfile = createAsyncThunk("organization/fetchProfile", async (_, { rejectWithValue }) => {
    try {
        const res = await axiosRequest.get("/Organization/mine");
        console.log("MINE PROFILE RESPONSE:", res.data);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Profile fetch failed");
    }
});

export const fetchOrgProfileById = createAsyncThunk("organization/fetchProfileById", async (id: string, { rejectWithValue }) => {
    try {
        const res = await axiosRequest.get(`/Organization/${id}`);
        console.log("PROFILE BY ID RESPONSE:", res.data);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Profile ID fetch failed");
    }
});

export const fetchOrgJobs = createAsyncThunk("organization/fetchJobs", async (_, { rejectWithValue }) => {
    try {
        const res = await axiosRequest.get("/JobApplication/by-organization/mine");
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Job list sync failed");
    }
});

export const fetchOrgApplicants = createAsyncThunk("organization/fetchApplicants", async (_, { rejectWithValue }) => {
    try {
        const res = await axiosRequest.get("/JobApplication/by-organization/mine");
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Applicants sync failed");
    }
});

export const createJobPost = createAsyncThunk("organization/createJob", async (job: { title: string; description: string; location: string; employmentType: string; experienceLevel: string; salary: string; organizationId: number }, { rejectWithValue }) => {
    try {
        const res = await axiosRequest.post("/JobApplication", job);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Vacancy posting failed");
    }
});

export const updateOrgProfile = createAsyncThunk("organization/updateProfile", async ({ id, data }: { id: string; data }, { rejectWithValue }) => {
    try {
        const res = await axiosRequest.put(`/Organization/${id}`, data);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Profile update failed");
    }
});

export const deleteJobPost = createAsyncThunk("organization/deleteJob", async (id: string, { rejectWithValue }) => {
    try {
        const res = await axiosRequest.delete(`/JobApplication/${id}`);
        return res.data || id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Job delete failed");
    }
});

export const updateApplicantStatus = createAsyncThunk("organization/updateApplicantStatus", async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
        const res = await axiosRequest.patch(`/JobApplication/${id}/status`, { status });
        return { applicantId: id, status: res.data?.status || status };
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Status change failed");
    }
});

import { createContext, useContext, useState } from "react";
import * as emergencyService from "../services/emergencyService";

const EmergencyContext = createContext();

export const useEmergency = () => {
  return useContext(EmergencyContext);
};

export const EmergencyProvider = ({ children }) => {

  const [currentEmergency, setCurrentEmergency] = useState(null);
  const [volunteers, setVolunteers] = useState([]);

  const triggerEmergency = async (data) => {
    const response = await emergencyService.triggerEmergency(data);
    setCurrentEmergency(response);
    return response;
  };

  const getEmergency = async (id) => {
    const response = await emergencyService.getEmergencyById(id);
    setCurrentEmergency(response);
    return response;
  };

  const acceptEmergency = async (id) => {
    return await emergencyService.acceptEmergency(id);
  };

  const resolveEmergency = async (id) => {
    const response = await emergencyService.resolveEmergency(id);
    setCurrentEmergency(null);
    return response;
  };

  const getNearbyVolunteers = async (lat, lng) => {
    const response = await emergencyService.getNearbyVolunteers(lat, lng);
    setVolunteers(response);
    return response;
  };

  const value = {
    currentEmergency,
    volunteers,
    triggerEmergency,
    getEmergency,
    acceptEmergency,
    resolveEmergency,
    getNearbyVolunteers
  };

  return (
    <EmergencyContext.Provider value={value}>
      {children}
    </EmergencyContext.Provider>
  );
};
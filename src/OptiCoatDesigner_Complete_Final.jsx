import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  BarChart,
  Bar,
} from "recharts";
import {
  Plus,
  Trash2,
  Upload,
  X,
  Settings,
  Zap,
  TrendingUp,
} from "lucide-react";

const ThinFilmDesigner = () => {
  const [activeTab, setActiveTab] = useState("designer");

  const materialDispersion = {
    SiO2: {
      type: "sellmeier",
      B1: 0.6961663,
      B2: 0.4079426,
      B3: 0.8974794,
      C1: 0.0684043,
      C2: 0.1162414,
      C3: 9.896161,
      color: "#E8F4F8",
      iadIncrease: 3.0,
      stress: -50,
    },
    SiO: {
      type: "cauchy",
      A: 1.85,
      B: 0.015,
      C: 0.0001,
      color: "#E5E5E5",
      iadIncrease: 2.5,
      stress: -80,
    },
    TiO2: {
      type: "cauchy",
      A: 2.35,
      B: 0.02,
      C: 0.0001,
      color: "#FFF4E6",
      iadIncrease: 4.0,
      stress: 150,
    },
    Al2O3: {
      type: "sellmeier",
      B1: 1.4313493,
      B2: 0.65054713,
      B3: 5.3414021,
      C1: 0.0726631,
      C2: 0.1193242,
      C3: 18.028251,
      color: "#F0F8FF",
      iadIncrease: 2.0,
      stress: -100,
    },
    ZrO2: {
      type: "cauchy",
      A: 2.13,
      B: 0.03,
      C: 0.0002,
      color: "#FFF0F5",
      iadIncrease: 3.5,
      stress: 200,
    },
    Ta2O5: {
      type: "cauchy",
      A: 2.1,
      B: 0.025,
      C: 0.00015,
      color: "#F5F5DC",
      iadIncrease: 3.0,
      stress: 180,
    },
    Nb2O5: {
      type: "cauchy",
      A: 2.28,
      B: 0.028,
      C: 0.00018,
      color: "#FFF8DC",
      iadIncrease: 3.5,
      stress: 170,
    },
    HfO2: {
      type: "cauchy",
      A: 1.95,
      B: 0.022,
      C: 0.00012,
      color: "#F0FFF0",
      iadIncrease: 2.5,
      stress: 190,
    },
    MgF2: {
      type: "sellmeier",
      B1: 0.48755108,
      B2: 0.39875031,
      B3: 2.3120353,
      C1: 0.04338408,
      C2: 0.09461442,
      C3: 23.793604,
      color: "#F5FFFA",
      iadIncrease: 1.5,
      stress: -30,
    },
    Y2O3: {
      type: "cauchy",
      A: 1.87,
      B: 0.018,
      C: 0.0001,
      color: "#FFFACD",
      iadIncrease: 2.0,
      stress: 120,
    },
    Custom: {
      type: "constant",
      n: 1.5,
      color: "#FFFFFF",
      iadIncrease: 0,
      stress: 0,
    },
  };

  const [layers, setLayers] = useState([
    { id: 1, material: "SiO2", thickness: 148.42, iad: null },
    { id: 2, material: "ZrO2", thickness: 30.16, iad: null },
    { id: 3, material: "SiO2", thickness: 23.68, iad: null },
    { id: 4, material: "ZrO2", thickness: 61.29, iad: null },
    { id: 5, material: "SiO2", thickness: 88.03, iad: null },
  ]);

  const [machines, setMachines] = useState([
    {
      id: 1,
      name: "Machine 1",
      toolingFactors: {
        SiO2: 1.0,
        SiO: 1.0,
        TiO2: 1.0,
        Al2O3: 1.0,
        ZrO2: 1.0,
        Ta2O5: 1.0,
        Nb2O5: 1.0,
        HfO2: 1.0,
        MgF2: 1.0,
        Y2O3: 1.0,
        Custom: 1.0,
      },
    },
  ]);
  const [currentMachineId, setCurrentMachineId] = useState(1);

  const [layerStacks, setLayerStacks] = useState([
    {
      id: 1,
      machineId: 1,
      name: "Layer Stack 1",
      layers: [
        { id: 1, material: "SiO2", thickness: 148.42, iad: null },
        { id: 2, material: "ZrO2", thickness: 30.16, iad: null },
        { id: 3, material: "SiO2", thickness: 23.68, iad: null },
        { id: 4, material: "ZrO2", thickness: 61.29, iad: null },
        { id: 5, material: "SiO2", thickness: 88.03, iad: null },
      ],
      visible: true,
      color: "#4f46e5",
    },
  ]);
  const [currentStackId, setCurrentStackId] = useState(1);

  const [substrate, setSubstrate] = useState({ material: "Glass", n: 1.52 });
  const [incident, setIncident] = useState({ material: "Air", n: 1.0 });
  const [wavelengthRange, setWavelengthRange] = useState({
    min: 350,
    max: 800,
    step: 5,
  });
  const [reflectivityRange, setReflectivityRange] = useState({
    min: 0,
    max: 100,
  });
  const [autoYAxis, setAutoYAxis] = useState(false);
  const [displayMode, setDisplayMode] = useState("reflectivity"); // 'reflectivity' or 'transmission'
  const [chartHeight, setChartHeight] = useState(65);
  const [isDragging, setIsDragging] = useState(false);
  const [reflectivityData, setReflectivityData] = useState([]);
  const [colorData, setColorData] = useState(null);
  const [stackColorData, setStackColorData] = useState({}); // Store color data for each stack
  const [experimentalColorData, setExperimentalColorData] = useState(null);
  const [experimentalData, setExperimentalData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showToolingModal, setShowToolingModal] = useState(false);
  const [showTargetsModal, setShowTargetsModal] = useState(false);
  const [showIADModal, setShowIADModal] = useState(false);
  const [currentIADLayer, setCurrentIADLayer] = useState(null);
  const [targets, setTargets] = useState([]);
  const [recipes, setRecipes] = useState([
    { id: 1, name: "Default Recipe", targets: [] },
  ]);
  const [currentRecipeId, setCurrentRecipeId] = useState(1);
  const [layerFactor, setLayerFactor] = useState(1.0);
  const [layerFactorMode, setLayerFactorMode] = useState("all");
  const [showFactorPreview, setShowFactorPreview] = useState(false);
  const [factorPreviewData, setFactorPreviewData] = useState([]);
  const [shiftValue, setShiftValue] = useState(0);
  const [shiftMode, setShiftMode] = useState("left-right");
  const [showShiftPreview, setShowShiftPreview] = useState(false);
  const [shiftPreviewData, setShiftPreviewData] = useState([]);
  const [previousLastThicknesses, setPreviousLastThicknesses] = useState([]);

  // Design Assistant State
  const [designPoints, setDesignPoints] = useState([]);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizationStage, setOptimizationStage] = useState("");
  const [solutions, setSolutions] = useState([]);
  const [designLayers, setDesignLayers] = useState(5);
  const [designMaterials, setDesignMaterials] = useState(["SiO2", "ZrO2"]);
  const [minimizePeaks, setMinimizePeaks] = useState(false);
  const [smoothnessWeight, setSmoothnessWeight] = useState(0.5);
  const [reverseEngineerData, setReverseEngineerData] = useState(null);
  const [reverseEngineerMode, setReverseEngineerMode] = useState(false);
  const [useAdhesionLayer, setUseAdhesionLayer] = useState(false);
  const [adhesionMaterial, setAdhesionMaterial] = useState("SiO2");
  const [adhesionThickness, setAdhesionThickness] = useState(10);

  // Recipe Tracking State
  const [trackingRuns, setTrackingRuns] = useState([]);
  const [selectedRecipeForTracking, setSelectedRecipeForTracking] =
    useState(null);
  const [selectedMachineForTracking, setSelectedMachineForTracking] =
    useState(null);
  const [selectedPlacementForTracking, setSelectedPlacementForTracking] =
    useState("INT");
  const [runNumber, setRunNumber] = useState("");
  const [trackingStats, setTrackingStats] = useState(null);
  const [trackingFilters, setTrackingFilters] = useState({
    machine: "all",
    recipe: "all",
    placement: "all",
  });

  // Monte Carlo Yield Simulation State
  const [mcNumRuns, setMcNumRuns] = useState(1000);
  const [mcThicknessError, setMcThicknessError] = useState(2.0);
  const [mcRIError, setMcRIError] = useState(1.0);
  const [mcToolingError, setMcToolingError] = useState(0.5);
  const [mcRunning, setMcRunning] = useState(false);
  const [mcProgress, setMcProgress] = useState(0);
  const [mcResults, setMcResults] = useState(null);
  const [mcShowExamples, setMcShowExamples] = useState(true);
  // Multi-Angle Display State
  const [showAngles, setShowAngles] = useState({
    angle_0: true,
    angle_15: false,
    angle_30: false,
    angle_45: false,
    angle_60: false,
  });

  // Coating Stress Calculator State
  const [stressResults, setStressResults] = useState(null);
  const [showStressModal, setShowStressModal] = useState(false);

  // Refs to prevent useEffect interference during delete operations
  // and to track previous layers for comparison to avoid infinite loops
  const isDeletingRef = React.useRef(false);
  const prevLayersRef = React.useRef(null);
  const isUpdatingStackRef = React.useRef(false);

  // Helper function to safely parse number inputs
  const safeParseFloat = (value, defaultValue = 0) => {
    if (value === "" || value === null || value === undefined) {
      return defaultValue;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // IAD Functions
  const openIADModal = (layerId) => {
    setCurrentIADLayer(layerId);
    setShowIADModal(true);
  };

  const getDefaultIADSettings = (material) => {
    const defaults = materialDispersion[material];
    return {
      enabled: true,
      voltage: 100,
      current: 1.0,
      o2Flow: 8,
      arFlow: 5,
      riIncrease: defaults?.iadIncrease || 3.0,
    };
  };

  const updateLayerIAD = (iadSettings) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === currentIADLayer ? { ...layer, iad: iadSettings } : layer
      )
    );

    setLayerStacks((prev) =>
      prev.map((stack) => ({
        ...stack,
        layers: stack.layers.map((layer) =>
          layer.id === currentIADLayer ? { ...layer, iad: iadSettings } : layer
        ),
      }))
    );

    setShowIADModal(false);
    setCurrentIADLayer(null);
  };

  const removeLayerIAD = (layerId) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, iad: null } : layer
      )
    );

    setLayerStacks((prev) =>
      prev.map((stack) => ({
        ...stack,
        layers: stack.layers.map((layer) =>
          layer.id === layerId ? { ...layer, iad: null } : layer
        ),
      }))
    );
  };

  const getRefractiveIndex = useCallback(
    (material, wavelength, iadSettings = null) => {
      const data = materialDispersion[material];
      if (!data) return 1.5;
      const lambdaMicrons = wavelength / 1000;

      let baseN;
      if (data.type === "sellmeier") {
        const { B1, B2, B3, C1, C2, C3 } = data;
        const lambda2 = lambdaMicrons * lambdaMicrons;
        const nSquared =
          1 +
          (B1 * lambda2) / (lambda2 - C1) +
          (B2 * lambda2) / (lambda2 - C2) +
          (B3 * lambda2) / (lambda2 - C3);
        baseN = Math.sqrt(Math.abs(nSquared));
      } else if (data.type === "cauchy") {
        const { A, B, C } = data;
        baseN =
          A + B / (lambdaMicrons * lambdaMicrons) + C / lambdaMicrons ** 4;
      } else {
        baseN = data.n;
      }

      // Apply IAD adjustment if enabled
      if (iadSettings && iadSettings.enabled) {
        const riMultiplier = 1 + iadSettings.riIncrease / 100;
        return baseN * riMultiplier;
      }

      return baseN;
    },
    []
  );

  const calculateReflectivityAtWavelength = useCallback(
    (lambda, layerStack = layers, stackId = currentStackId, angle = 0) => {
      try {
        const n0 = incident.n;
        const ns = substrate.n;

        const stack = layerStacks.find((s) => s.id === stackId);
        const machine = machines.find((m) => m.id === stack?.machineId);
        const toolingFactors = machine?.toolingFactors || {};

        // Normal incidence (angle = 0) - use existing fast calculation
        if (angle === 0) {
          let M11r = 1,
            M11i = 0,
            M12r = 0,
            M12i = 0,
            M21r = 0,
            M21i = 0,
            M22r = 1,
            M22i = 0;

          for (let i = layerStack.length - 1; i >= 0; i--) {
            const n = getRefractiveIndex(
              layerStack[i].material,
              lambda,
              layerStack[i].iad
            );
            const toolingFactor = toolingFactors[layerStack[i].material] || 1.0;
            const d = layerStack[i].thickness * toolingFactor;
            const delta = (2 * Math.PI * n * d) / lambda;
            const cosD = Math.cos(delta);
            const sinD = Math.sin(delta);

            const L11r = cosD,
              L11i = 0,
              L12r = 0,
              L12i = sinD / n,
              L21r = 0,
              L21i = n * sinD,
              L22r = cosD,
              L22i = 0;
            const newM11r =
              M11r * L11r - M11i * L11i + M12r * L21r - M12i * L21i;
            const newM11i =
              M11r * L11i + M11i * L11r + M12r * L21i + M12i * L21r;
            const newM12r =
              M11r * L12r - M11i * L12i + M12r * L22r - M12i * L22i;
            const newM12i =
              M11r * L12i + M11i * L12r + M12r * L22i + M12i * L22r;
            const newM21r =
              M21r * L11r - M21i * L11i + M22r * L21r - M22i * L21i;
            const newM21i =
              M21r * L11i + M21i * L11r + M22r * L21i + M22i * L21r;
            const newM22r =
              M21r * L12r - M21i * L12i + M22r * L22r - M22i * L22i;
            const newM22i =
              M21r * L12i + M21i * L12r + M22r * L22i + M22i * L22r;

            M11r = newM11r;
            M11i = newM11i;
            M12r = newM12r;
            M12i = newM12i;
            M21r = newM21r;
            M21i = newM21i;
            M22r = newM22r;
            M22i = newM22i;
          }

          const numR = n0 * M11r + n0 * ns * M12r - M21r - ns * M22r;
          const numI = n0 * M11i + n0 * ns * M12i - M21i - ns * M22i;
          const denR = n0 * M11r + n0 * ns * M12r + M21r + ns * M22r;
          const denI = n0 * M11i + n0 * ns * M12i + M21i + ns * M22i;
          const denMag = denR * denR + denI * denI;
          const rR = (numR * denR + numI * denI) / denMag;
          const rI = (numI * denR - numR * denI) / denMag;
          const R = rR * rR + rI * rI;
          return Math.min(Math.max(R, 0), 1);
        }

        // Oblique incidence - calculate using Snell's law for each layer
        const angleRad = (angle * Math.PI) / 180;
        const theta0 = angleRad;

        const angles = [theta0];
        const ns_array = [n0];

        for (let i = layerStack.length - 1; i >= 0; i--) {
          const n = getRefractiveIndex(
            layerStack[i].material,
            lambda,
            layerStack[i].iad
          );
          ns_array.push(n);
          const sinTheta = (n0 * Math.sin(theta0)) / n;
          if (sinTheta > 1) return 0; // Total internal reflection
          angles.push(Math.asin(sinTheta));
        }

        ns_array.push(ns);
        const sinThetaS = (n0 * Math.sin(theta0)) / ns;
        if (sinThetaS > 1) return 0;
        angles.push(Math.asin(sinThetaS));

        // Calculate s-polarization (TE mode)
        let M11r_s = 1,
          M11i_s = 0,
          M12r_s = 0,
          M12i_s = 0,
          M21r_s = 0,
          M21i_s = 0,
          M22r_s = 1,
          M22i_s = 0;

        for (let i = layerStack.length - 1; i >= 0; i--) {
          const n = getRefractiveIndex(
            layerStack[i].material,
            lambda,
            layerStack[i].iad
          );
          const toolingFactor = toolingFactors[layerStack[i].material] || 1.0;
          const d = layerStack[i].thickness * toolingFactor;
          const theta = angles[angles.length - 2 - i];
          const cosTheta = Math.cos(theta);
          const delta = (2 * Math.PI * n * d * cosTheta) / lambda;
          const cosD = Math.cos(delta);
          const sinD = Math.sin(delta);
          const eta = n * cosTheta;

          const L11r = cosD,
            L11i = 0,
            L12r = 0,
            L12i = sinD / eta,
            L21r = 0,
            L21i = eta * sinD,
            L22r = cosD,
            L22i = 0;
          const newM11r =
            M11r_s * L11r - M11i_s * L11i + M12r_s * L21r - M12i_s * L21i;
          const newM11i =
            M11r_s * L11i + M11i_s * L11r + M12r_s * L21i + M12i_s * L21r;
          const newM12r =
            M11r_s * L12r - M11i_s * L12i + M12r_s * L22r - M12i_s * L22i;
          const newM12i =
            M11r_s * L12i + M11i_s * L12r + M12r_s * L22i + M12i_s * L22r;
          const newM21r =
            M21r_s * L11r - M21i_s * L11i + M22r_s * L21r - M22i_s * L21i;
          const newM21i =
            M21r_s * L11i + M21i_s * L11r + M22r_s * L21i + M22i_s * L21r;
          const newM22r =
            M21r_s * L12r - M21i_s * L12i + M22r_s * L22r - M22i_s * L22i;
          const newM22i =
            M21r_s * L12i + M21i_s * L12r + M22r_s * L22i + M22i_s * L22r;

          M11r_s = newM11r;
          M11i_s = newM11i;
          M12r_s = newM12r;
          M12i_s = newM12i;
          M21r_s = newM21r;
          M21i_s = newM21i;
          M22r_s = newM22r;
          M22i_s = newM22i;
        }

        const eta0_s = n0 * Math.cos(theta0);
        const etas_s = ns * Math.cos(angles[angles.length - 1]);
        const numR_s =
          eta0_s * M11r_s + eta0_s * etas_s * M12r_s - M21r_s - etas_s * M22r_s;
        const numI_s =
          eta0_s * M11i_s + eta0_s * etas_s * M12i_s - M21i_s - etas_s * M22i_s;
        const denR_s =
          eta0_s * M11r_s + eta0_s * etas_s * M12r_s + M21r_s + etas_s * M22r_s;
        const denI_s =
          eta0_s * M11i_s + eta0_s * etas_s * M12i_s + M21i_s + etas_s * M22i_s;
        const denMag_s = denR_s * denR_s + denI_s * denI_s;
        const rR_s = (numR_s * denR_s + numI_s * denI_s) / denMag_s;
        const rI_s = (numI_s * denR_s - numR_s * denI_s) / denMag_s;
        const Rs = rR_s * rR_s + rI_s * rI_s;

        // Calculate p-polarization (TM mode)
        let M11r_p = 1,
          M11i_p = 0,
          M12r_p = 0,
          M12i_p = 0,
          M21r_p = 0,
          M21i_p = 0,
          M22r_p = 1,
          M22i_p = 0;

        for (let i = layerStack.length - 1; i >= 0; i--) {
          const n = getRefractiveIndex(
            layerStack[i].material,
            lambda,
            layerStack[i].iad
          );
          const toolingFactor = toolingFactors[layerStack[i].material] || 1.0;
          const d = layerStack[i].thickness * toolingFactor;
          const theta = angles[angles.length - 2 - i];
          const cosTheta = Math.cos(theta);
          const delta = (2 * Math.PI * n * d * cosTheta) / lambda;
          const cosD = Math.cos(delta);
          const sinD = Math.sin(delta);
          const eta = n / cosTheta;

          const L11r = cosD,
            L11i = 0,
            L12r = 0,
            L12i = sinD / eta,
            L21r = 0,
            L21i = eta * sinD,
            L22r = cosD,
            L22i = 0;
          const newM11r =
            M11r_p * L11r - M11i_p * L11i + M12r_p * L21r - M12i_p * L21i;
          const newM11i =
            M11r_p * L11i + M11i_p * L11r + M12r_p * L21i + M12i_p * L21r;
          const newM12r =
            M11r_p * L12r - M11i_p * L12i + M12r_p * L22r - M12i_p * L22i;
          const newM12i =
            M11r_p * L12i + M11i_p * L12r + M12r_p * L22i + M12i_p * L22r;
          const newM21r =
            M21r_p * L11r - M21i_p * L11i + M22r_p * L21r - M22i_p * L21i;
          const newM21i =
            M21r_p * L11i + M21i_p * L11r + M22r_p * L21i + M22i_p * L21r;
          const newM22r =
            M21r_p * L12r - M21i_p * L12i + M22r_p * L22r - M22i_p * L22i;
          const newM22i =
            M21r_p * L12i + M21i_p * L12r + M22r_p * L22i + M22i_p * L22r;

          M11r_p = newM11r;
          M11i_p = newM11i;
          M12r_p = newM12r;
          M12i_p = newM12i;
          M21r_p = newM21r;
          M21i_p = newM21i;
          M22r_p = newM22r;
          M22i_p = newM22i;
        }

        const eta0_p = n0 / Math.cos(theta0);
        const etas_p = ns / Math.cos(angles[angles.length - 1]);
        const numR_p =
          eta0_p * M11r_p + eta0_p * etas_p * M12r_p - M21r_p - etas_p * M22r_p;
        const numI_p =
          eta0_p * M11i_p + eta0_p * etas_p * M12i_p - M21i_p - etas_p * M22i_p;
        const denR_p =
          eta0_p * M11r_p + eta0_p * etas_p * M12r_p + M21r_p + etas_p * M22r_p;
        const denI_p =
          eta0_p * M11i_p + eta0_p * etas_p * M12i_p + M21i_p + etas_p * M22i_p;
        const denMag_p = denR_p * denR_p + denI_p * denI_p;
        const rR_p = (numR_p * denR_p + numI_p * denI_p) / denMag_p;
        const rI_p = (numI_p * denR_p - numR_p * denI_p) / denMag_p;
        const Rp = rR_p * rR_p + rI_p * rI_p;

        // Average s and p polarizations for unpolarized light
        const R_avg = (Rs + Rp) / 2;
        return Math.min(Math.max(R_avg, 0), 1);
      } catch (e) {
        return 0;
      }
    },
    [
      getRefractiveIndex,
      incident.n,
      substrate.n,
      layerStacks,
      machines,
      currentStackId,
    ]
  );

  const calculateColorInfo = useCallback((visibleData) => {
    if (visibleData.length === 0) return null;

    // CIE 1931 2° Standard Observer color matching functions (380-780nm, 5nm intervals)
    const CIE_DATA = {
      380: { x: 0.0014, y: 0.0, z: 0.0065, d65: 49.98 },
      385: { x: 0.0022, y: 0.0001, z: 0.0105, d65: 52.31 },
      390: { x: 0.0042, y: 0.0001, z: 0.0201, d65: 54.65 },
      395: { x: 0.0076, y: 0.0002, z: 0.0362, d65: 68.7 },
      400: { x: 0.0143, y: 0.0004, z: 0.0679, d65: 82.75 },
      405: { x: 0.0232, y: 0.0006, z: 0.1102, d65: 87.12 },
      410: { x: 0.0435, y: 0.0012, z: 0.2074, d65: 91.49 },
      415: { x: 0.0776, y: 0.0022, z: 0.3713, d65: 92.46 },
      420: { x: 0.1344, y: 0.004, z: 0.6456, d65: 93.43 },
      425: { x: 0.2148, y: 0.0073, z: 1.0391, d65: 90.06 },
      430: { x: 0.2839, y: 0.0116, z: 1.3856, d65: 86.68 },
      435: { x: 0.3285, y: 0.0168, z: 1.623, d65: 95.77 },
      440: { x: 0.3483, y: 0.023, z: 1.7471, d65: 104.86 },
      445: { x: 0.3481, y: 0.0298, z: 1.7826, d65: 110.94 },
      450: { x: 0.3362, y: 0.038, z: 1.7721, d65: 117.01 },
      455: { x: 0.3187, y: 0.048, z: 1.7441, d65: 117.41 },
      460: { x: 0.2908, y: 0.06, z: 1.6692, d65: 117.81 },
      465: { x: 0.2511, y: 0.0739, z: 1.5281, d65: 116.34 },
      470: { x: 0.1954, y: 0.091, z: 1.2876, d65: 114.86 },
      475: { x: 0.1421, y: 0.1126, z: 1.0419, d65: 115.39 },
      480: { x: 0.0956, y: 0.139, z: 0.813, d65: 115.92 },
      485: { x: 0.058, y: 0.1693, z: 0.6162, d65: 112.37 },
      490: { x: 0.032, y: 0.208, z: 0.4652, d65: 108.81 },
      495: { x: 0.0147, y: 0.2586, z: 0.3533, d65: 109.08 },
      500: { x: 0.0049, y: 0.323, z: 0.272, d65: 109.35 },
      505: { x: 0.0024, y: 0.4073, z: 0.2123, d65: 108.58 },
      510: { x: 0.0093, y: 0.503, z: 0.1582, d65: 107.8 },
      515: { x: 0.0291, y: 0.6082, z: 0.1117, d65: 106.3 },
      520: { x: 0.0633, y: 0.71, z: 0.0782, d65: 104.79 },
      525: { x: 0.1096, y: 0.7932, z: 0.0573, d65: 106.24 },
      530: { x: 0.1655, y: 0.862, z: 0.0422, d65: 107.69 },
      535: { x: 0.2257, y: 0.9149, z: 0.0298, d65: 106.05 },
      540: { x: 0.2904, y: 0.954, z: 0.0203, d65: 104.41 },
      545: { x: 0.3597, y: 0.9803, z: 0.0134, d65: 104.23 },
      550: { x: 0.4334, y: 0.995, z: 0.0087, d65: 104.05 },
      555: { x: 0.5121, y: 1.0, z: 0.0057, d65: 102.02 },
      560: { x: 0.5945, y: 0.995, z: 0.0039, d65: 100.0 },
      565: { x: 0.6784, y: 0.9786, z: 0.0027, d65: 98.17 },
      570: { x: 0.7621, y: 0.952, z: 0.0021, d65: 96.33 },
      575: { x: 0.8425, y: 0.9154, z: 0.0018, d65: 96.06 },
      580: { x: 0.9163, y: 0.87, z: 0.0017, d65: 95.79 },
      585: { x: 0.9786, y: 0.8163, z: 0.0014, d65: 92.24 },
      590: { x: 1.0263, y: 0.757, z: 0.0011, d65: 88.69 },
      595: { x: 1.0567, y: 0.6949, z: 0.001, d65: 89.35 },
      600: { x: 1.0622, y: 0.631, z: 0.0008, d65: 90.01 },
      605: { x: 1.0456, y: 0.5668, z: 0.0006, d65: 89.8 },
      610: { x: 1.0026, y: 0.503, z: 0.0003, d65: 89.6 },
      615: { x: 0.9384, y: 0.4412, z: 0.0002, d65: 88.65 },
      620: { x: 0.8544, y: 0.381, z: 0.0002, d65: 87.7 },
      625: { x: 0.7514, y: 0.321, z: 0.0001, d65: 85.49 },
      630: { x: 0.6424, y: 0.265, z: 0.0, d65: 83.29 },
      635: { x: 0.5419, y: 0.217, z: 0.0, d65: 83.49 },
      640: { x: 0.4479, y: 0.175, z: 0.0, d65: 83.7 },
      645: { x: 0.3608, y: 0.1382, z: 0.0, d65: 81.86 },
      650: { x: 0.2835, y: 0.107, z: 0.0, d65: 80.03 },
      655: { x: 0.2187, y: 0.0816, z: 0.0, d65: 80.12 },
      660: { x: 0.1649, y: 0.061, z: 0.0, d65: 80.21 },
      665: { x: 0.1212, y: 0.0446, z: 0.0, d65: 81.25 },
      670: { x: 0.0874, y: 0.032, z: 0.0, d65: 82.28 },
      675: { x: 0.0636, y: 0.0232, z: 0.0, d65: 80.28 },
      680: { x: 0.0468, y: 0.017, z: 0.0, d65: 78.28 },
      685: { x: 0.0329, y: 0.0119, z: 0.0, d65: 74.0 },
      690: { x: 0.0227, y: 0.0082, z: 0.0, d65: 69.72 },
      695: { x: 0.0158, y: 0.0057, z: 0.0, d65: 70.67 },
      700: { x: 0.0114, y: 0.0041, z: 0.0, d65: 71.61 },
      705: { x: 0.0081, y: 0.0029, z: 0.0, d65: 72.98 },
      710: { x: 0.0058, y: 0.0021, z: 0.0, d65: 74.35 },
      715: { x: 0.0041, y: 0.0015, z: 0.0, d65: 67.98 },
      720: { x: 0.0029, y: 0.001, z: 0.0, d65: 61.6 },
      725: { x: 0.002, y: 0.0007, z: 0.0, d65: 65.74 },
      730: { x: 0.0014, y: 0.0005, z: 0.0, d65: 69.89 },
      735: { x: 0.001, y: 0.0004, z: 0.0, d65: 72.49 },
      740: { x: 0.0007, y: 0.0003, z: 0.0, d65: 75.09 },
      745: { x: 0.0005, y: 0.0002, z: 0.0, d65: 69.34 },
      750: { x: 0.0003, y: 0.0001, z: 0.0, d65: 63.59 },
      755: { x: 0.0002, y: 0.0001, z: 0.0, d65: 55.01 },
      760: { x: 0.0002, y: 0.0001, z: 0.0, d65: 46.42 },
      765: { x: 0.0001, y: 0.0, z: 0.0, d65: 56.61 },
      770: { x: 0.0001, y: 0.0, z: 0.0, d65: 66.81 },
      775: { x: 0.0001, y: 0.0, z: 0.0, d65: 65.09 },
      780: { x: 0.0, y: 0.0, z: 0.0, d65: 63.38 },
    };

    // Interpolate CIE data for any wavelength
    const getCIEData = (lambda) => {
      const lower = Math.floor(lambda / 5) * 5;
      const upper = Math.ceil(lambda / 5) * 5;
      if (lower === upper || !CIE_DATA[lower] || !CIE_DATA[upper]) {
        return (
          CIE_DATA[lower] || CIE_DATA[upper] || { x: 0, y: 0, z: 0, d65: 0 }
        );
      }
      const t = (lambda - lower) / (upper - lower);
      const l = CIE_DATA[lower];
      const u = CIE_DATA[upper];
      return {
        x: l.x + t * (u.x - l.x),
        y: l.y + t * (u.y - l.y),
        z: l.z + t * (u.z - l.z),
        d65: l.d65 + t * (u.d65 - l.d65),
      };
    };

    // Calculate tristimulus values XYZ
    let X = 0,
      Y = 0,
      Z = 0,
      normalization = 0;

    visibleData.forEach((d) => {
      const R = d.theoretical / 100; // Reflectance as fraction
      const cie = getCIEData(d.wavelength);

      X += R * cie.d65 * cie.x;
      Y += R * cie.d65 * cie.y;
      Z += R * cie.d65 * cie.z;
      normalization += cie.d65 * cie.y;
    });

    // Normalize by D65 illuminant
    if (normalization === 0) return null;
    X = X / normalization;
    Y = Y / normalization;
    Z = Z / normalization;

    // Convert XYZ to Lab (using D65 white point: Xn=0.95047, Yn=1.0, Zn=1.08883)
    const Xn = 0.95047,
      Yn = 1.0,
      Zn = 1.08883;

    const f = (t) => {
      const delta = 6.0 / 29.0;
      if (t > delta * delta * delta) {
        return Math.pow(t, 1.0 / 3.0);
      } else {
        return t / (3 * delta * delta) + 4.0 / 29.0;
      }
    };

    const fx = f(X / Xn);
    const fy = f(Y / Yn);
    const fz = f(Z / Zn);

    const L = 116 * fy - 16; // Lightness (0-100)
    const a = 500 * (fx - fy); // Green (-) to Red (+)
    const b = 200 * (fy - fz); // Blue (-) to Yellow (+)

    // Convert Lab to LCh (cylindrical coordinates)
    const C = Math.sqrt(a * a + b * b); // Chroma (color saturation)
    let h = (Math.atan2(b, a) * 180) / Math.PI; // Hue angle
    if (h < 0) h += 360;

    // Convert XYZ to sRGB for display
    let R_linear = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
    let G_linear = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
    let B_linear = X * 0.0557 + Y * -0.204 + Z * 1.057;

    // sRGB gamma correction
    const gammaCorrect = (c) => {
      if (c <= 0.0031308) return 12.92 * c;
      return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    };

    R_linear = gammaCorrect(R_linear);
    G_linear = gammaCorrect(G_linear);
    B_linear = gammaCorrect(B_linear);

    // Normalize to valid RGB range
    const maxRGB = Math.max(R_linear, G_linear, B_linear);
    if (maxRGB > 1) {
      R_linear /= maxRGB;
      G_linear /= maxRGB;
      B_linear /= maxRGB;
    }

    const R_8bit = Math.max(0, Math.min(255, Math.round(R_linear * 255)));
    const G_8bit = Math.max(0, Math.min(255, Math.round(G_linear * 255)));
    const B_8bit = Math.max(0, Math.min(255, Math.round(B_linear * 255)));

    // Calculate dominant wavelength
    let maxReflectivity = 0;
    let dominantWavelength = 0;
    visibleData.forEach((d) => {
      if (d.theoretical > maxReflectivity) {
        maxReflectivity = d.theoretical;
        dominantWavelength = d.wavelength;
      }
    });

    // Color name from hue angle (LCh)
    let colorName = "Neutral/Achromatic";
    if (C > 10) {
      // Only name if color has sufficient chroma
      if (h >= 0 && h < 30) colorName = "Red";
      else if (h < 60) colorName = "Orange";
      else if (h < 90) colorName = "Yellow";
      else if (h < 150) colorName = "Yellow-Green";
      else if (h < 210) colorName = "Green-Cyan";
      else if (h < 270) colorName = "Cyan-Blue";
      else if (h < 330) colorName = "Blue-Magenta";
      else colorName = "Magenta-Red";
    }

    const avgReflectivity = (
      visibleData.reduce((sum, d) => sum + d.theoretical, 0) /
      visibleData.length
    ).toFixed(1);

    return {
      rgb: `rgb(${R_8bit}, ${G_8bit}, ${B_8bit})`,
      hex: `#${R_8bit.toString(16).padStart(2, "0")}${G_8bit.toString(
        16
      ).padStart(2, "0")}${B_8bit.toString(16).padStart(2, "0")}`,
      dominantWavelength,
      colorName,
      avgReflectivity,
      // CIE XYZ
      X: X.toFixed(4),
      Y: Y.toFixed(4),
      Z: Z.toFixed(4),
      // CIE Lab
      L: L.toFixed(1),
      a_star: a.toFixed(1),
      b_star: b.toFixed(1),
      // LCh
      L_lch: L.toFixed(1),
      C: C.toFixed(1),
      h: h.toFixed(1),
      // Spectral data for visualization
      spectralData: visibleData.map((d) => ({
        wavelength: d.wavelength,
        reflectivity: d.theoretical,
      })),
    };
  }, []);

  const calculateReflectedColor = useCallback(
    (data) => {
      const visibleData = data.filter(
        (d) => d.wavelength >= 380 && d.wavelength <= 780
      );

      if (visibleData.length === 0) {
        setColorData(null);
        return;
      }

      const colorInfo = calculateColorInfo(visibleData);
      setColorData(colorInfo);
    },
    [calculateColorInfo]
  );

  const generateOptimizationSuggestions = useCallback((combinedData) => {
    const newSuggestions = [];
    let sumSquaredError = 0,
      count = 0;

    combinedData.forEach((d) => {
      if (d.experimental !== undefined) {
        sumSquaredError += Math.pow(d.theoretical - d.experimental, 2);
        count++;
      }
    });

    if (count > 0) {
      const rmsError = Math.sqrt(sumSquaredError / count);
      newSuggestions.push({ message: `RMS Error: ${rmsError.toFixed(2)}%` });
    }
    setSuggestions(newSuggestions);
  }, []);

  const calculateCoatingStress = useCallback(() => {
    if (!layers || layers.length === 0) {
      setStressResults(null);
      return;
    }

    const stressData = [];
    let cumulativeStress = 0;

    layers.forEach((layer, idx) => {
      const materialData = materialDispersion[layer.material];
      const intrinsicStress = materialData?.stress || 0; // MPa
      const thickness = layer.thickness; // nm

      // Stress force = intrinsic stress × thickness (MPa·nm)
      const stressForce = intrinsicStress * thickness;
      cumulativeStress += stressForce;

      stressData.push({
        layerNum: idx + 1,
        material: layer.material,
        thickness: thickness,
        intrinsicStress: intrinsicStress,
        stressForce: stressForce,
        cumulativeStress: cumulativeStress,
        stressType:
          intrinsicStress > 0
            ? "Compressive"
            : intrinsicStress < 0
            ? "Tensile"
            : "Neutral",
      });
    });

    // Calculate total optical thickness for additional context
    const totalOpticalThickness = layers.reduce((sum, layer) => {
      const n = getRefractiveIndex(layer.material, 550); // Reference at 550nm
      return sum + n * layer.thickness;
    }, 0);

    // Assess risk level
    const totalStress = Math.abs(cumulativeStress);
    let riskLevel, riskColor, recommendation;

    if (totalStress < 50000) {
      // < 50 MPa·µm
      riskLevel = "LOW";
      riskColor = "#10b981"; // green
      recommendation = "Safe for production. No annealing required.";
    } else if (totalStress < 150000) {
      // 50-150 MPa·µm
      riskLevel = "MEDIUM";
      riskColor = "#f59e0b"; // amber
      recommendation =
        "Monitor adhesion in production. Consider post-deposition annealing at 150°C for 2 hours to reduce stress.";
    } else {
      // > 150 MPa·µm
      riskLevel = "HIGH";
      riskColor = "#ef4444"; // red
      recommendation =
        "High risk of delamination. REDESIGN RECOMMENDED: Balance high-stress materials with low-stress materials, reduce layer thicknesses, or use annealing at 150-200°C.";
    }

    setStressResults({
      layers: stressData,
      totalStress: cumulativeStress,
      totalStressMagnitude: totalStress,
      totalPhysicalThickness: layers.reduce((sum, l) => sum + l.thickness, 0),
      totalOpticalThickness: totalOpticalThickness,
      riskLevel: riskLevel,
      riskColor: riskColor,
      recommendation: recommendation,
    });
  }, [layers, getRefractiveIndex]);

  const calculateReflectivity = useCallback(() => {
    try {
      const { min, max, step } = wavelengthRange;
      const data = [];

      const anglesToCalculate = [
        { key: "angle_0", value: 0, enabled: showAngles.angle_0 },
        { key: "angle_15", value: 15, enabled: showAngles.angle_15 },
        { key: "angle_30", value: 30, enabled: showAngles.angle_30 },
        { key: "angle_45", value: 45, enabled: showAngles.angle_45 },
        { key: "angle_60", value: 60, enabled: showAngles.angle_60 },
      ];

      for (let lambda = min; lambda <= max; lambda += step) {
        const dataPoint = { wavelength: lambda };

        // Calculate for all visible layer stacks
        layerStacks.forEach((stack) => {
          if (stack.visible) {
            // Calculate for each enabled angle
            anglesToCalculate.forEach((angleData) => {
              if (
                angleData.enabled ||
                (angleData.value === 0 && stack.id === currentStackId)
              ) {
                const R = calculateReflectivityAtWavelength(
                  lambda,
                  stack.layers,
                  stack.id,
                  angleData.value
                );
                const key =
                  angleData.value === 0
                    ? `stack_${stack.id}`
                    : `stack_${stack.id}_${angleData.key}`;
                dataPoint[key] = R * 100;

                const T_key =
                  angleData.value === 0
                    ? `stack_${stack.id}_transmission`
                    : `stack_${stack.id}_${angleData.key}_transmission`;
                dataPoint[T_key] = (1 - R) * 100;
              }
            });
          }
        });

        // Add experimental data if available
        if (experimentalData) {
          const expPoint = experimentalData.find(
            (d) => Math.abs(d.wavelength - lambda) < step * 2
          );
          if (expPoint) {
            dataPoint.experimental = expPoint.reflectivity;
            dataPoint.experimental_transmission = 100 - expPoint.reflectivity;
          }
        }

        data.push(dataPoint);
      }

      setReflectivityData(data);

      // Calculate reflected color for current stack only (for backward compatibility)
      const currentStackData = data.map((d) => ({
        wavelength: d.wavelength,
        theoretical: d[`stack_${currentStackId}`] || 0,
      }));
      calculateReflectedColor(currentStackData);

      // Calculate color data for ALL visible stacks
      const newStackColorData = {};
      layerStacks.forEach((stack) => {
        if (stack.visible) {
          const stackData = data.map((d) => ({
            wavelength: d.wavelength,
            theoretical: d[`stack_${stack.id}`] || 0,
          }));
          // Calculate color for this stack
          const visibleData = stackData.filter(
            (d) => d.wavelength >= 380 && d.wavelength <= 780
          );
          if (visibleData.length > 0) {
            const colorInfo = calculateColorInfo(visibleData);
            if (colorInfo) {
              newStackColorData[stack.id] = {
                ...colorInfo,
                stackName: stack.name,
                stackColor: stack.color,
              };
            }
          }
        }
      });
      setStackColorData(newStackColorData);

      // Calculate color data for experimental data if available
      if (experimentalData) {
        const expData = data
          .map((d) => ({
            wavelength: d.wavelength,
            theoretical: d.experimental || 0,
          }))
          .filter((d) => d.theoretical > 0);

        const visibleExpData = expData.filter(
          (d) => d.wavelength >= 380 && d.wavelength <= 780
        );
        if (visibleExpData.length > 0) {
          const expColorInfo = calculateColorInfo(visibleExpData);
          setExperimentalColorData(expColorInfo);
        } else {
          setExperimentalColorData(null);
        }
      } else {
        setExperimentalColorData(null);
      }

      // Only auto-adjust Y-axis if Auto mode is enabled
      if (autoYAxis && data.length > 0) {
        const allValues = [];
        const dataKey = displayMode === "transmission" ? "_transmission" : "";

        data.forEach((d) => {
          layerStacks.forEach((stack) => {
            if (stack.visible) {
              const key = `stack_${stack.id}${dataKey}`;
              if (d[key] !== undefined) {
                allValues.push(d[key]);
              }
            }
          });
          if (displayMode === "transmission" && d.experimental_transmission) {
            allValues.push(d.experimental_transmission);
          } else if (displayMode === "reflectivity" && d.experimental) {
            allValues.push(d.experimental);
          }
        });

        if (allValues.length > 0) {
          const minVal = Math.min(...allValues);
          const maxVal = Math.max(...allValues);
          const padding = (maxVal - minVal) * 0.1;
          setReflectivityRange({
            min: Math.max(0, Math.floor(minVal - padding)),
            max: Math.ceil(maxVal + padding),
          });
        }
      }

      if (experimentalData) generateOptimizationSuggestions(data);
    } catch (e) {
      console.error("Calculation error:", e);
    }
  }, [
    wavelengthRange,
    layerStacks,
    calculateReflectivityAtWavelength,
    experimentalData,
    autoYAxis,
    currentStackId,
    calculateReflectedColor,
    generateOptimizationSuggestions,
    displayMode,
    calculateColorInfo,
    showAngles,
  ]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n");
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(",");
      if (parts.length >= 2) {
        const wavelength = parseFloat(parts[0]);

        const reflectivity = parseFloat(parts[1]);
        if (!isNaN(wavelength) && !isNaN(reflectivity)) {
          data.push({ wavelength, reflectivity });
        }
      }
    }
    if (data.length > 0) setExperimentalData(data);
  };

  const handleReverseEngineerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n");
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(",");
      if (parts.length >= 2) {
        const wavelength = parseFloat(parts[0]);
        const reflectivity = parseFloat(parts[1]);
        if (!isNaN(wavelength) && !isNaN(reflectivity)) {
          data.push({ wavelength, reflectivity });
        }
      }
    }
    if (data.length > 0) {
      setReverseEngineerData(data);
      setReverseEngineerMode(true);
    }
  };

  const clearReverseEngineerData = () => {
    setReverseEngineerData(null);
    setReverseEngineerMode(false);
  };

  const clearExperimentalData = () => {
    setExperimentalData(null);
    setSuggestions([]);
  };

  // Recipe Tracking Functions
  const handleTrackingFileUpload = async (e, placement) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate selections
    if (!selectedMachineForTracking || !selectedRecipeForTracking) {
      alert("Please select a machine and recipe before uploading data.");
      e.target.value = "";
      return;
    }

    const newRuns = [];

    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      const file = files[fileIndex];
      const text = await file.text();
      const lines = text.split("\n");
      const data = [];

      // Parse CSV - expecting format: wavelength, reflectivity
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(",");
        if (parts.length >= 2) {
          const wavelength = parseFloat(parts[0]);
          const reflectivity = parseFloat(parts[1]);
          if (!isNaN(wavelength) && !isNaN(reflectivity)) {
            data.push({ wavelength, reflectivity });
          }
        }
      }

      if (data.length > 0) {
        newRuns.push({
          id: Date.now() + fileIndex,
          filename: file.name,
          timestamp: new Date().toISOString(),
          data: data,
          machineId: selectedMachineForTracking,
          machineName:
            machines.find((m) => m.id === selectedMachineForTracking)?.name ||
            "Unknown",
          recipeId: selectedRecipeForTracking,
          recipeName:
            recipes.find((r) => r.id === selectedRecipeForTracking)?.name ||
            "Unknown",
          placement: placement,
          runNumber: runNumber || "",
        });
      }
    }

    if (newRuns.length > 0) {
      setTrackingRuns([...trackingRuns, ...newRuns]);
      applyTrackingFilters([...trackingRuns, ...newRuns]);
    }

    // Reset file input
    e.target.value = "";
  };

  const applyTrackingFilters = (runs) => {
    const filtered = runs.filter((run) => {
      if (
        trackingFilters.machine !== "all" &&
        run.machineId !== trackingFilters.machine
      )
        return false;
      if (
        trackingFilters.recipe !== "all" &&
        run.recipeId !== trackingFilters.recipe
      )
        return false;
      if (
        trackingFilters.placement !== "all" &&
        run.placement !== trackingFilters.placement
      )
        return false;
      return true;
    });

    calculateTrackingStats(filtered);
  };

  const updateTrackingFilter = (filterType, value) => {
    const newFilters = { ...trackingFilters, [filterType]: value };
    setTrackingFilters(newFilters);

    // Apply filters to existing runs
    const filtered = trackingRuns.filter((run) => {
      if (newFilters.machine !== "all" && run.machineId !== newFilters.machine)
        return false;
      if (newFilters.recipe !== "all" && run.recipeId !== newFilters.recipe)
        return false;
      if (
        newFilters.placement !== "all" &&
        run.placement !== newFilters.placement
      )
        return false;
      return true;
    });

    calculateTrackingStats(filtered);
  };

  const calculateTrackingStats = (runs) => {
    if (runs.length === 0) {
      setTrackingStats(null);
      return;
    }

    // Get all unique wavelengths
    const allWavelengths = new Set();
    runs.forEach((run) => {
      run.data.forEach((d) => allWavelengths.add(d.wavelength));
    });

    const sortedWavelengths = Array.from(allWavelengths).sort((a, b) => a - b);

    // Calculate statistics for each wavelength
    const stats = sortedWavelengths.map((wavelength) => {
      const dataPoint = { wavelength };

      // Add data from each run
      runs.forEach((run, idx) => {
        const point = run.data.find(
          (d) => Math.abs(d.wavelength - wavelength) < 0.5
        );
        dataPoint[`run${idx}`] = point ? point.reflectivity : null;
      });

      // Calculate statistics
      const values = runs
        .map((run, idx) => dataPoint[`run${idx}`])
        .filter((v) => v !== null);

      if (values.length > 0) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance =
          values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const min = Math.min(...values);
        const max = Math.max(...values);

        dataPoint.mean = mean;
        dataPoint.stdDev = stdDev;
        dataPoint.min = min;
        dataPoint.max = max;
        dataPoint.upperBound = mean + stdDev;
        dataPoint.lowerBound = mean - stdDev;
      }

      return dataPoint;
    });

    setTrackingStats(stats);
  };

  const deleteTrackingRun = (id) => {
    const newRuns = trackingRuns.filter((r) => r.id !== id);
    setTrackingRuns(newRuns);
    applyTrackingFilters(newRuns);
  };

  const clearAllTrackingRuns = () => {
    if (window.confirm("Are you sure you want to clear all tracking data?")) {
      setTrackingRuns([]);
      setTrackingStats(null);
    }
  };

  const saveTrackingData = () => {
    if (trackingRuns.length === 0) {
      alert("No data to save");
      return;
    }

    const dataToSave = {
      exportDate: new Date().toISOString(),
      totalRuns: trackingRuns.length,
      runs: trackingRuns.map((run) => ({
        id: run.id,
        filename: run.filename,
        timestamp: run.timestamp,
        machineId: run.machineId,
        machineName: run.machineName,
        recipeId: run.recipeId,
        recipeName: run.recipeName,
        placement: run.placement,
        runNumber: run.runNumber,
        dataPoints: run.data.length,
      })),
      fullData: trackingRuns,
    };

    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tracking-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Monte Carlo Simulation Function
  const runMonteCarloSimulation = async () => {
    if (targets.length === 0) {
      alert(
        "Please define at least one target specification before running Monte Carlo simulation."
      );
      return;
    }

    setMcRunning(true);
    setMcProgress(0);
    setMcResults(null);

    const results = {
      totalRuns: mcNumRuns,
      passedRuns: 0,
      failedRuns: 0,
      passRate: 0,
      errorDistribution: [],
      passedExamples: [],
      failedExamples: [],
      worstCaseError: 0,
      bestCaseError: Infinity,
      avgError: 0,
    };

    const allErrors = [];
    const passedRuns = [];
    const failedRuns = [];

    for (let run = 0; run < mcNumRuns; run++) {
      if (run % 50 === 0) {
        setMcProgress((run / mcNumRuns) * 100);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      const virtualLayers = layers.map((layer) => {
        const thicknessMultiplier =
          1 +
          ((Math.random() + Math.random() + Math.random() + Math.random() - 2) /
            2) *
            (mcThicknessError / 100);

        let virtualIAD = layer.iad ? { ...layer.iad } : null;
        if (virtualIAD && virtualIAD.enabled) {
          const riMultiplier =
            1 +
            ((Math.random() +
              Math.random() +
              Math.random() +
              Math.random() -
              2) /
              2) *
              (mcRIError / 100);
          virtualIAD = {
            ...virtualIAD,
            riIncrease: virtualIAD.riIncrease * riMultiplier,
          };
        }

        return {
          ...layer,
          thickness: layer.thickness * thicknessMultiplier,
          iad: virtualIAD,
        };
      });

      const stack = layerStacks.find((s) => s.id === currentStackId);
      const machine = machines.find((m) => m.id === stack?.machineId);
      const baseToolingFactors = machine?.toolingFactors || {};

      const virtualToolingFactors = {};
      Object.keys(baseToolingFactors).forEach((material) => {
        const toolingMultiplier =
          1 +
          ((Math.random() + Math.random() + Math.random() + Math.random() - 2) /
            2) *
            (mcToolingError / 100);
        virtualToolingFactors[material] =
          baseToolingFactors[material] * toolingMultiplier;
      });

      const virtualStackId = Date.now() + run;
      const virtualStack = {
        id: virtualStackId,
        machineId: currentMachineId,
        layers: virtualLayers,
        visible: true,
      };

      const virtualMachine = {
        id: currentMachineId,
        toolingFactors: virtualToolingFactors,
      };

      const originalStacks = [...layerStacks];
      const originalMachines = [...machines];
      layerStacks.push(virtualStack);
      machines.push(virtualMachine);

      let maxError = 0;
      let passed = true;

      targets.forEach((target) => {
        const wavelengths = [];
        if (target.wavelengthMin === target.wavelengthMax) {
          wavelengths.push(target.wavelengthMin);
        } else {
          for (let i = 0; i < 5; i++) {
            const wl =
              target.wavelengthMin +
              (i / 4) * (target.wavelengthMax - target.wavelengthMin);
            wavelengths.push(wl);
          }
        }

        wavelengths.forEach((wl) => {
          const R =
            calculateReflectivityAtWavelength(
              wl,
              virtualLayers,
              virtualStackId
            ) * 100;

          if (R < target.reflectivityMin || R > target.reflectivityMax) {
            passed = false;
            const error = Math.max(
              target.reflectivityMin - R,
              R - target.reflectivityMax,
              0
            );
            maxError = Math.max(maxError, Math.abs(error));
          }
        });
      });

      layerStacks.splice(layerStacks.indexOf(virtualStack), 1);
      machines.splice(machines.indexOf(virtualMachine), 1);

      allErrors.push(maxError);

      if (passed) {
        results.passedRuns++;
        if (passedRuns.length < 3) {
          passedRuns.push({ layers: virtualLayers, error: maxError });
        } else {
          passedRuns.sort((a, b) => a.error - b.error);
          if (maxError < passedRuns[2].error) {
            passedRuns[2] = { layers: virtualLayers, error: maxError };
          }
        }
      } else {
        results.failedRuns++;
        if (failedRuns.length < 3) {
          failedRuns.push({ layers: virtualLayers, error: maxError });
        } else {
          failedRuns.sort((a, b) => b.error - a.error);
          if (maxError > failedRuns[2].error) {
            failedRuns[2] = { layers: virtualLayers, error: maxError };
          }
        }
      }

      results.worstCaseError = Math.max(results.worstCaseError, maxError);
      results.bestCaseError = Math.min(results.bestCaseError, maxError);
    }

    results.passRate = (results.passedRuns / results.totalRuns) * 100;
    results.avgError = allErrors.reduce((a, b) => a + b, 0) / allErrors.length;
    results.passedExamples = passedRuns;
    results.failedExamples = failedRuns;

    const bins = 10;
    const binSize = (results.worstCaseError - results.bestCaseError) / bins;
    const histogram = new Array(bins).fill(0).map((_, i) => ({
      range: `${(results.bestCaseError + i * binSize).toFixed(1)}-${(
        results.bestCaseError +
        (i + 1) * binSize
      ).toFixed(1)}%`,
      count: 0,
    }));

    allErrors.forEach((error) => {
      const binIndex = Math.min(
        Math.floor((error - results.bestCaseError) / binSize),
        bins - 1
      );
      if (binIndex >= 0) {
        histogram[binIndex].count++;
      }
    });

    results.errorDistribution = histogram;

    setMcProgress(100);
    setMcResults(results);

    setTimeout(() => {
      setMcRunning(false);
      setMcProgress(0);
    }, 500);
  };

  // BUG FIX #2 & #3: Improved useEffect to prevent infinite loops
  // Uses refs to track previous state and avoid unnecessary updates
  useEffect(() => {
    // Skip during delete operations (BUG FIX #1)
    if (isDeletingRef.current) {
      return;
    }

    // Skip if we're in the middle of updating stacks from this effect
    if (isUpdatingStackRef.current) {
      return;
    }

    if (
      activeTab === "designer" &&
      layerStacks.length > 0 &&
      currentStackId !== null
    ) {
      // Check if layers actually changed by comparing with previous value
      const layersJson = JSON.stringify(layers);
      const prevLayersJson = prevLayersRef.current;

      // Only update layerStacks if layers have actually changed
      if (layersJson !== prevLayersJson) {
        prevLayersRef.current = layersJson;

        // Check if the current stack's layers are different from our layers state
        const currentStack = layerStacks.find((s) => s.id === currentStackId);
        const currentStackLayersJson = currentStack
          ? JSON.stringify(currentStack.layers)
          : null;

        if (currentStackLayersJson !== layersJson) {
          // Mark that we're updating to prevent re-triggering
          isUpdatingStackRef.current = true;

          setLayerStacks((prevStacks) => {
            const updatedStacks = prevStacks.map((stack) => {
              if (stack.id === currentStackId) {
                return { ...stack, layers: layers };
              }
              return stack;
            });
            return updatedStacks;
          });

          // Reset the flag after a microtask to allow the state update to complete
          Promise.resolve().then(() => {
            isUpdatingStackRef.current = false;
          });
        }
      }

      // Always recalculate reflectivity when relevant dependencies change
      calculateReflectivity();
    } else if (activeTab === "designer" && layerStacks.length === 0) {
      // If no stacks, still calculate reflectivity for empty state
      calculateReflectivity();
    }
  }, [
    layers,
    substrate,
    incident,
    wavelengthRange,
    experimentalData,
    autoYAxis,
    activeTab,
    currentStackId,
    calculateReflectivity,
    layerStacks.length, // Only depend on length, not the full array to avoid loops
  ]);

  // BUG FIX #1: Properly use isDeletingRef during delete operations
  const deleteLayerStack = (id) => {
    // Set the deleting flag to prevent useEffect interference
    isDeletingRef.current = true;

    try {
      const newStacks = layerStacks.filter((s) => s.id !== id);

      // If we deleted the current stack, switch to another stack in the same machine
      if (currentStackId === id) {
        const machineStacks = newStacks.filter(
          (s) => s.machineId === currentMachineId
        );
        if (machineStacks.length > 0) {
          const newCurrentStack = machineStacks[0];
          setCurrentStackId(newCurrentStack.id);
          setLayers(newCurrentStack.layers);
          // Update the ref to match new layers
          prevLayersRef.current = JSON.stringify(newCurrentStack.layers);
        } else {
          // If no stacks remain in this machine, clear the current stack ID and layers
          setCurrentStackId(null);
          setLayers([]);
          prevLayersRef.current = JSON.stringify([]);
        }
      }

      setLayerStacks(newStacks);
    } finally {
      // Reset the deleting flag after state updates are queued
      // Use setTimeout to ensure state updates have been processed
      setTimeout(() => {
        isDeletingRef.current = false;
      }, 0);
    }
  };

  const addLayerStack = () => {
    // Generate a new unique ID
    const newId = Math.max(0, ...layerStacks.map((s) => s.id)) + 1;

    // Count stacks in current machine for naming
    const machineStacks = layerStacks.filter(
      (s) => s.machineId === currentMachineId
    );

    // Create new stack with default layers
    const newStack = {
      id: newId,
      machineId: currentMachineId,
      name: `Layer Stack ${machineStacks.length + 1}`,
      layers: [{ id: 1, material: "SiO2", thickness: 100, iad: null }],
      visible: true,
      color: `hsl(${(newId * 60) % 360}, 70%, 50%)`,
    };

    // Add the new stack
    setLayerStacks([...layerStacks, newStack]);

    // Switch to the new stack
    setCurrentStackId(newId);
    setLayers(newStack.layers);

    // Update the ref to match new layers
    prevLayersRef.current = JSON.stringify(newStack.layers);
  };

  const switchLayerStack = (id) => {
    setCurrentStackId(id);
    const stack = layerStacks.find((s) => s.id === id);
    if (stack) {
      setLayers(stack.layers);
      // Update the ref to match new layers
      prevLayersRef.current = JSON.stringify(stack.layers);
    }
  };

  const toggleStackVisibility = (id) => {
    setLayerStacks(
      layerStacks.map((s) => {
        if (s.id === id) {
          return { ...s, visible: !s.visible };
        }
        return s;
      })
    );
  };

  const renameLayerStack = (id, newName) => {
    setLayerStacks(
      layerStacks.map((s) => {
        if (s.id === id) {
          return { ...s, name: newName };
        }
        return s;
      })
    );
  };

  // Machine management functions
  const addMachine = () => {
    const newMachine = {
      id: Date.now(),
      name: `Machine ${machines.length + 1}`,
      toolingFactors: {
        SiO2: 1.0,
        SiO: 1.0,
        TiO2: 1.0,
        Al2O3: 1.0,
        ZrO2: 1.0,
        Ta2O5: 1.0,
        Nb2O5: 1.0,
        HfO2: 1.0,
        MgF2: 1.0,
        Y2O3: 1.0,
        Custom: 1.0,
      },
    };
    setMachines([...machines, newMachine]);
    setCurrentMachineId(newMachine.id);
  };

  const deleteMachine = (id) => {
    if (machines.length === 1) {
      alert("Cannot delete the last machine");
      return;
    }

    // Set deleting flag
    isDeletingRef.current = true;

    try {
      // Delete all layer stacks associated with this machine
      const newStacks = layerStacks.filter((s) => s.machineId !== id);
      setLayerStacks(newStacks);

      // Delete the machine
      const newMachines = machines.filter((m) => m.id !== id);
      setMachines(newMachines);

      // Switch to another machine
      if (currentMachineId === id && newMachines.length > 0) {
        const newMachineId = newMachines[0].id;
        setCurrentMachineId(newMachineId);

        // Switch to a stack in the new machine if available
        const newMachineStacks = newStacks.filter(
          (s) => s.machineId === newMachineId
        );
        if (newMachineStacks.length > 0) {
          setCurrentStackId(newMachineStacks[0].id);
          setLayers(newMachineStacks[0].layers);
          prevLayersRef.current = JSON.stringify(newMachineStacks[0].layers);
        } else {
          setCurrentStackId(null);
          setLayers([]);
          prevLayersRef.current = JSON.stringify([]);
        }
      }
    } finally {
      setTimeout(() => {
        isDeletingRef.current = false;
      }, 0);
    }
  };

  const switchMachine = (id) => {
    setCurrentMachineId(id);

    // Switch to the first stack in this machine, or clear if none
    const machineStacks = layerStacks.filter((s) => s.machineId === id);
    if (machineStacks.length > 0) {
      setCurrentStackId(machineStacks[0].id);
      setLayers(machineStacks[0].layers);
      prevLayersRef.current = JSON.stringify(machineStacks[0].layers);
    } else {
      setCurrentStackId(null);
      setLayers([]);
      prevLayersRef.current = JSON.stringify([]);
    }
  };

  const renameMachine = (id, newName) => {
    setMachines(
      machines.map((m) => {
        if (m.id === id) {
          return { ...m, name: newName };
        }
        return m;
      })
    );
  };

  const handleDividerMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      // Find the container element
      const container = document.querySelector(".designer-container");
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newHeight = ((e.clientY - rect.top) / rect.height) * 100;

      // Constrain between 30% and 80%
      if (newHeight > 30 && newHeight < 80) {
        setChartHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  const addLayer = () => {
    const newId = Math.max(...layers.map((l) => l.id), 0) + 1;
    setLayers([...layers, { id: newId, material: "SiO2", thickness: 100 }]);
  };

  const insertLayerAfter = (index) => {
    const newId = Math.max(...layers.map((l) => l.id), 0) + 1;
    const newLayer = { id: newId, material: "SiO2", thickness: 100, iad: null };
    const newLayers = [...layers];
    newLayers.splice(index + 1, 0, newLayer);
    setLayers(newLayers);
  };

  const removeLayer = (id) => {
    if (layers.length > 1) setLayers(layers.filter((l) => l.id !== id));
  };

  const updateLayer = (id, field, value) => {
    setLayers(
      layers.map((l) => {
        if (l.id === id) {
          if (field === "material") return { ...l, material: value };
          // Allow empty string for user to clear and retype
          if (value === "" || value === null) return { ...l, [field]: "" };
          const numValue = parseFloat(value);
          // Prevent negative values for thickness
          if (field === "thickness" && numValue < 0)
            return { ...l, [field]: 0 };
          return { ...l, [field]: numValue };
        }
        return l;
      })
    );
  };

  const updateToolingFactor = (machineId, material, value) => {
    setMachines(
      machines.map((machine) => {
        if (machine.id === machineId) {
          return {
            ...machine,
            toolingFactors: {
              ...machine.toolingFactors,
              [material]: parseFloat(value) || 1.0,
            },
          };
        }
        return machine;
      })
    );
  };

  const applyFactorToLayers = () => {
    const factor = parseFloat(layerFactor);
    if (isNaN(factor) || factor <= 0) {
      alert("Please enter a valid positive number for the factor");
      return;
    }

    // Save current last thicknesses for undo
    setPreviousLastThicknesses(layers.map((l) => l.lastThickness || null));

    const updatedLayers = layers.map((layer, index) => {
      const layerNumber = index + 1;
      let shouldApply = false;

      if (layerFactorMode === "all") {
        shouldApply = true;
      } else if (layerFactorMode === "odd") {
        shouldApply = layerNumber % 2 === 1;
      } else if (layerFactorMode === "even") {
        shouldApply = layerNumber % 2 === 0;
      }

      if (shouldApply) {
        return {
          ...layer,
          lastThickness: layer.thickness, // Store current as last
          originalThickness: layer.originalThickness || layer.thickness, // Store original if not already stored
          thickness: layer.thickness * factor,
        };
      }
      return {
        ...layer,
        lastThickness: layer.thickness, // Store current as last even if not applying
        originalThickness: layer.originalThickness || layer.thickness, // Store original even if not applying factor
      };
    });

    setLayers(updatedLayers);
    setShowFactorPreview(false);
    setFactorPreviewData([]);
  };

  const calculateFactorPreview = useCallback(() => {
    const factor = parseFloat(layerFactor);
    if (isNaN(factor) || factor <= 0 || factor === 1.0) {
      setShowFactorPreview(false);
      setFactorPreviewData([]);
      return;
    }

    // Create preview layers with factor applied
    const previewLayers = layers.map((layer, index) => {
      const layerNumber = index + 1;
      let shouldApply = false;

      if (layerFactorMode === "all") {
        shouldApply = true;
      } else if (layerFactorMode === "odd") {
        shouldApply = layerNumber % 2 === 1;
      } else if (layerFactorMode === "even") {
        shouldApply = layerNumber % 2 === 0;
      }

      if (shouldApply) {
        return {
          ...layer,
          thickness: layer.thickness * factor,
        };
      }
      return layer;
    });

    // Calculate reflectivity for preview
    const { min, max, step } = wavelengthRange;
    const data = [];

    for (let lambda = min; lambda <= max; lambda += step) {
      const R = calculateReflectivityAtWavelength(
        lambda,
        previewLayers,
        currentStackId
      );
      data.push({
        wavelength: lambda,
        preview: R * 100,
        preview_transmission: (1 - R) * 100,
      });
    }

    setFactorPreviewData(data);
    setShowFactorPreview(true);
  }, [
    layerFactor,
    layerFactorMode,
    layers,
    wavelengthRange,
    calculateReflectivityAtWavelength,
    currentStackId,
  ]);

  // Update preview when factor or mode changes
  useEffect(() => {
    if (activeTab === "designer") {
      calculateFactorPreview();
    }
  }, [layerFactor, layerFactorMode, activeTab, calculateFactorPreview]);

  const calculateShiftPreview = useCallback(() => {
    const shift = parseFloat(shiftValue);
    if (isNaN(shift) || shift === 0) {
      setShowShiftPreview(false);
      setShiftPreviewData([]);
      return;
    }

    const { min, max, step } = wavelengthRange;
    const data = [];

    if (shiftMode === "left-right") {
      // Wavelength shift: shift the curve horizontally
      // Create a complete dataset with the shifted curve
      for (let lambda = min; lambda <= max; lambda += step) {
        // For the shifted preview, sample from (lambda - shift)
        const sampledLambda = lambda - shift;

        // Calculate R at the sampled wavelength
        const R = calculateReflectivityAtWavelength(
          sampledLambda,
          layers,
          currentStackId
        );

        data.push({
          wavelength: lambda,
          shiftPreview: R * 100,
          shiftPreview_transmission: (1 - R) * 100,
        });
      }
    } else {
      // Up/down shift: shift reflectivity values
      for (let lambda = min; lambda <= max; lambda += step) {
        const R = calculateReflectivityAtWavelength(
          lambda,
          layers,
          currentStackId
        );
        const shiftedR = Math.max(0, Math.min(100, R * 100 + shift));
        const shiftedT = Math.max(0, Math.min(100, (1 - R) * 100 - shift));
        data.push({
          wavelength: lambda,
          shiftPreview: shiftedR,
          shiftPreview_transmission: shiftedT,
        });
      }
    }

    setShiftPreviewData(data);
    setShowShiftPreview(true);
  }, [
    shiftValue,
    shiftMode,
    layers,
    wavelengthRange,
    calculateReflectivityAtWavelength,
    currentStackId,
  ]);

  const calculateShiftedThicknesses = useCallback(() => {
    const shift = parseFloat(shiftValue);
    if (isNaN(shift) || shift === 0 || shiftMode !== "left-right") {
      return null;
    }

    // For wavelength shift, calculate proportional thickness changes
    // When shifting right (+), we need thicker layers to move peaks to higher wavelengths
    // When shifting left (-), we need thinner layers
    // The relationship is approximately linear: thickness_new = thickness_old * (1 + shift/lambda_center)

    const centerWavelength = (wavelengthRange.min + wavelengthRange.max) / 2;
    const scaleFactor = (centerWavelength + shift) / centerWavelength;

    return layers.map((layer) => ({
      ...layer,
      shiftedThickness: layer.thickness * scaleFactor,
    }));
  }, [shiftValue, shiftMode, layers, wavelengthRange]);

  const applyShift = () => {
    const shift = parseFloat(shiftValue);
    if (isNaN(shift) || shift === 0) {
      alert("Please enter a non-zero shift value");
      return;
    }

    if (shiftMode === "left-right") {
      const shiftedLayers = calculateShiftedThicknesses();
      if (shiftedLayers) {
        // Save current last thicknesses for undo
        setPreviousLastThicknesses(layers.map((l) => l.lastThickness || null));

        const updatedLayers = shiftedLayers.map((layer) => ({
          ...layer,
          lastThickness: layer.thickness, // Store current as last
          originalThickness: layer.originalThickness || layer.thickness,
          thickness: layer.shiftedThickness,
        }));
        setLayers(updatedLayers);
        setShowShiftPreview(false);
        setShiftPreviewData([]);
        setShiftValue(0); // Reset shift value after applying
      }
    } else {
      alert(
        "Up/Down shift cannot be directly applied to layer thicknesses. This mode is for visualization only."
      );
    }
  };

  // Update shift preview when shift value or mode changes
  useEffect(() => {
    if (activeTab === "designer") {
      calculateShiftPreview();
    }
  }, [shiftValue, shiftMode, activeTab, calculateShiftPreview]);

  const calculateXAxisTicks = useCallback(() => {
    const { min, max } = wavelengthRange;
    const range = max - min;

    // Calculate how many ticks we can fit (assuming ~50px per tick to avoid overlap)
    const chartWidth =
      typeof window !== "undefined" ? window.innerWidth * 0.7 : 1000; // Approximate chart width
    const maxTicks = Math.floor(chartWidth / 50);

    // Calculate ideal tick interval
    const idealInterval = range / maxTicks;

    // Round to nice intervals (prioritize 50, 25, 20, 10, 5)
    let tickInterval;
    if (idealInterval <= 5) {
      tickInterval = 5;
    } else if (idealInterval <= 10) {
      tickInterval = 10;
    } else if (idealInterval <= 20) {
      tickInterval = 20;
    } else if (idealInterval <= 25) {
      tickInterval = 25;
    } else if (idealInterval <= 50) {
      tickInterval = 50;
    } else if (idealInterval <= 100) {
      tickInterval = 100;
    } else if (idealInterval <= 200) {
      tickInterval = 200;
    } else {
      tickInterval = Math.ceil(idealInterval / 100) * 100;
    }

    // Generate ticks
    const ticks = [];
    let tick = Math.ceil(min / tickInterval) * tickInterval; // Start at first multiple of interval >= min

    while (tick <= max) {
      ticks.push(tick);
      tick += tickInterval;
    }

    // Ensure we have min and max if they're not already included
    if (ticks[0] !== min && ticks[0] - min > tickInterval / 2) {
      ticks.unshift(min);
    }
    if (
      ticks[ticks.length - 1] !== max &&
      max - ticks[ticks.length - 1] > tickInterval / 2
    ) {
      ticks.push(max);
    }

    return ticks;
  }, [wavelengthRange]);

  const calculateYAxisTicks = useCallback(() => {
    const { min, max } = reflectivityRange;
    const range = max - min;

    // Calculate how many ticks we can fit vertically (assuming ~40px per tick)
    const chartHeight = 400; // Approximate chart height based on chartHeight state
    const maxTicks = Math.floor(chartHeight / 40);

    // Calculate ideal tick interval
    const idealInterval = range / maxTicks;

    // Round to nice intervals (prioritize values ending in 5 or 0)
    let tickInterval;
    if (idealInterval <= 1) {
      tickInterval = 1;
    } else if (idealInterval <= 2) {
      tickInterval = 2;
    } else if (idealInterval <= 5) {
      tickInterval = 5;
    } else if (idealInterval <= 10) {
      tickInterval = 10;
    } else if (idealInterval <= 20) {
      tickInterval = 20;
    } else if (idealInterval <= 25) {
      tickInterval = 25;
    } else if (idealInterval <= 50) {
      tickInterval = 50;
    } else {
      tickInterval = Math.ceil(idealInterval / 10) * 10; // Round to nearest 10
    }

    // Generate ticks
    const ticks = [];
    let tick = Math.floor(min / tickInterval) * tickInterval; // Start at first multiple of interval <= min

    // Ensure we start at or below min
    if (tick < min) {
      tick = min;
    }

    while (tick <= max) {
      ticks.push(tick);
      tick += tickInterval;
    }

    // Ensure we have min and max
    if (ticks[0] > min) {
      ticks.unshift(min);
    }
    if (ticks[ticks.length - 1] < max) {
      ticks.push(max);
    }

    return ticks;
  }, [reflectivityRange]);

  const resetToOriginal = () => {
    const updatedLayers = layers.map((layer) => ({
      ...layer,
      thickness: layer.originalThickness || layer.thickness,
      lastThickness: undefined,
      originalThickness: undefined,
    }));
    setLayers(updatedLayers);
    setPreviousLastThicknesses([]);
    setShowFactorPreview(false);
    setFactorPreviewData([]);
    setShowShiftPreview(false);
    setShiftPreviewData([]);
    setShiftValue(0);
  };

  const undoLastChange = () => {
    // Check if there's anything to undo
    const hasLastThickness = layers.some((l) => l.lastThickness !== undefined);
    if (!hasLastThickness) {
      alert("No changes to undo");
      return;
    }

    const updatedLayers = layers.map((layer, index) => {
      if (layer.lastThickness !== undefined) {
        return {
          ...layer,
          thickness: layer.lastThickness,
          lastThickness: previousLastThicknesses[index] || undefined,
        };
      }
      return layer;
    });

    setLayers(updatedLayers);
    // Clear previous last thicknesses since we've used them
    setPreviousLastThicknesses([]);
  };

  const addTarget = () => {
    const newTarget = {
      id: Date.now(),
      name: `M${targets.length + 1}`,
      wavelengthMin: 380,
      wavelengthMax: 420,
      reflectivityMin: 3,
      reflectivityMax: 12,
    };
    const newTargets = [...targets, newTarget];
    setTargets(newTargets);
    updateRecipeTargets(currentRecipeId, newTargets);
  };

  const removeTarget = (id) => {
    const newTargets = targets.filter((t) => t.id !== id);
    setTargets(newTargets);
    updateRecipeTargets(currentRecipeId, newTargets);
  };

  const updateTarget = (id, field, value) => {
    const newTargets = targets.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          [field]: field === "name" ? value : parseFloat(value) || 0,
        };
      }
      return t;
    });
    setTargets(newTargets);
    updateRecipeTargets(currentRecipeId, newTargets);
  };

  const addRecipe = () => {
    const newRecipe = {
      id: Date.now(),
      name: `Recipe ${recipes.length + 1}`,
      targets: [],
    };
    setRecipes([...recipes, newRecipe]);
    setCurrentRecipeId(newRecipe.id);
    setTargets([]);
  };

  const deleteRecipe = (id) => {
    if (recipes.length === 1) return;
    const newRecipes = recipes.filter((r) => r.id !== id);
    setRecipes(newRecipes);
    if (currentRecipeId === id) {
      setCurrentRecipeId(newRecipes[0].id);
      setTargets(newRecipes[0].targets);
    }
  };

  const switchRecipe = (id) => {
    setCurrentRecipeId(id);
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      setTargets(recipe.targets);
    }
  };

  const updateRecipeTargets = (recipeId, newTargets) => {
    setRecipes(
      recipes.map((r) => {
        if (r.id === recipeId) {
          return { ...r, targets: newTargets };
        }
        return r;
      })
    );
  };

  const renameRecipe = (id, newName) => {
    setRecipes(
      recipes.map((r) => {
        if (r.id === id) {
          return { ...r, name: newName };
        }
        return r;
      })
    );
  };

  // Design Assistant Functions
  const addDesignPoint = () => {
    setDesignPoints([
      ...designPoints,
      {
        id: Date.now(),
        wavelengthMin: 550,
        wavelengthMax: 550,
        reflectivityMin: 40,
        reflectivityMax: 50,
        useWavelengthRange: false,
        useReflectivityRange: true,
      },
    ]);
  };

  const removeDesignPoint = (id) => {
    setDesignPoints(designPoints.filter((p) => p.id !== id));
  };

  const updateDesignPoint = (id, field, value) => {
    setDesignPoints(
      designPoints.map((p) => {
        if (p.id === id) {
          if (
            field === "useWavelengthRange" ||
            field === "useReflectivityRange"
          ) {
            return { ...p, [field]: value };
          }
          // For numeric fields, parse and store as number
          const numValue =
            value === ""
              ? 0
              : typeof value === "number"
              ? value
              : parseFloat(value) || 0;
          return { ...p, [field]: numValue };
        }
        return p;
      })
    );
  };

  const optimizeDesign = async () => {
    // Validation
    if (!reverseEngineerMode && designPoints.length === 0) {
      alert(
        "Please add at least one target point or upload a CSV file for reverse engineering"
      );
      return;
    }

    if (reverseEngineerMode && !reverseEngineerData) {
      alert("Please upload a CSV file for reverse engineering");
      return;
    }

    setOptimizing(true);
    setSolutions([]);
    setOptimizationProgress(0);
    setOptimizationStage("Initializing...");

    // Separate materials by refractive index (low vs high)
    const lowIndexMaterials = [];
    const highIndexMaterials = [];
    const threshold = 1.8; // Approximate threshold between low and high index

    designMaterials.forEach((mat) => {
      const n = getRefractiveIndex(mat, 550);
      if (n < threshold) {
        lowIndexMaterials.push(mat);
      } else {
        highIndexMaterials.push(mat);
      }
    });

    // Ensure we have both types
    if (lowIndexMaterials.length === 0 || highIndexMaterials.length === 0) {
      alert(
        "Please select both low-index (n<1.8) and high-index (n>1.8) materials for alternating structure"
      );
      setOptimizing(false);
      return;
    }

    // DRAMATICALLY increased iterations for <3% error target
    // This will take longer but produce much better results
    const numIterations = reverseEngineerMode ? 100000 : 75000;
    const foundSolutions = [];

    // Track best solution for refinement
    let bestSolution = null;

    setOptimizationStage("Phase 1: Extensive Random Search");

    for (let iter = 0; iter < numIterations; iter++) {
      // Update progress every 200 iterations
      if (iter % 200 === 0) {
        setOptimizationProgress((iter / numIterations) * 30); // First 30% for random search
        await new Promise((resolve) => setTimeout(resolve, 0)); // Allow UI update
      }

      // Generate random layer stack with alternating low/high index
      const testLayers = [];

      // Randomly start with either low or high index
      let useLowIndex = Math.random() < 0.5;

      for (let i = 0; i < designLayers; i++) {
        let material;
        if (useLowIndex) {
          material =
            lowIndexMaterials[
              Math.floor(Math.random() * lowIndexMaterials.length)
            ];
        } else {
          material =
            highIndexMaterials[
              Math.floor(Math.random() * highIndexMaterials.length)
            ];
        }

        // Wider thickness range for better exploration
        const thickness = reverseEngineerMode
          ? 30 + Math.random() * 150
          : 25 + Math.random() * 125;
        testLayers.push({ id: i, material, thickness });

        // Alternate for next layer
        useLowIndex = !useLowIndex;
      }

      // Calculate error
      let error = 0;
      let errorCount = 0;

      if (reverseEngineerMode) {
        // Reverse engineering mode: fit to uploaded CSV data
        reverseEngineerData.forEach((dataPoint) => {
          const calcR =
            calculateReflectivityAtWavelength(
              dataPoint.wavelength,
              testLayers
            ) * 100;
          error += Math.pow(calcR - dataPoint.reflectivity, 2);
          errorCount++;
        });
      } else {
        // Normal mode: fit to design points
        designPoints.forEach((point) => {
          if (point.useWavelengthRange) {
            // Sample multiple wavelengths across the range
            const numSamples = 5;
            const step =
              (point.wavelengthMax - point.wavelengthMin) / (numSamples - 1);
            for (let i = 0; i < numSamples; i++) {
              const lambda = point.wavelengthMin + i * step;
              const calcR =
                calculateReflectivityAtWavelength(lambda, testLayers) * 100;

              if (point.useReflectivityRange) {
                // Range mode: only penalize if outside range
                if (calcR < point.reflectivityMin) {
                  error += Math.pow(point.reflectivityMin - calcR, 2);
                  errorCount++;
                } else if (calcR > point.reflectivityMax) {
                  error += Math.pow(calcR - point.reflectivityMax, 2);
                  errorCount++;
                }
              } else {
                // Single target mode
                const targetValue =
                  (point.reflectivityMin + point.reflectivityMax) / 2;
                error += Math.pow(calcR - targetValue, 2);
                errorCount++;
              }
            }
          } else {
            // Single wavelength
            const lambda = (point.wavelengthMin + point.wavelengthMax) / 2;
            const calcR =
              calculateReflectivityAtWavelength(lambda, testLayers) * 100;

            if (point.useReflectivityRange) {
              if (calcR < point.reflectivityMin) {
                error += Math.pow(point.reflectivityMin - calcR, 2);
              } else if (calcR > point.reflectivityMax) {
                error += Math.pow(calcR - point.reflectivityMax, 2);
              }
            } else {
              const targetValue =
                (point.reflectivityMin + point.reflectivityMax) / 2;
              error += Math.pow(calcR - targetValue, 2);
            }
            errorCount++;
          }
        });
      }

      error = errorCount > 0 ? Math.sqrt(error / errorCount) : 0;

      // Add smoothness penalty - apply to BOTH target mode AND reverse engineering
      const { min, max, step } = wavelengthRange;
      let prevR = null;
      let smoothnessPenalty = 0;
      let smoothnessCount = 0;
      let peakCount = 0;
      let prevSlope = null;

      // Sample across full wavelength range to detect peaks and smoothness
      for (let lambda = min; lambda <= max; lambda += step * 2) {
        const calcR =
          calculateReflectivityAtWavelength(lambda, testLayers) * 100;

        if (prevR !== null) {
          const currentSlope = calcR - prevR;

          // Detect peaks (sign change in slope)
          if (
            prevSlope !== null &&
            Math.sign(currentSlope) !== Math.sign(prevSlope) &&
            Math.abs(currentSlope) > 1
          ) {
            peakCount++;
          }

          // Penalize large variations between adjacent points
          const variation = Math.abs(calcR - prevR);
          smoothnessPenalty += Math.pow(variation, 2);
          smoothnessCount++;

          prevSlope = currentSlope;
        }
        prevR = calcR;
      }

      if (smoothnessCount > 0) {
        const avgVariation = Math.sqrt(smoothnessPenalty / smoothnessCount);

        // Calculate total optical thickness (sum of n*d for each layer)
        const totalOpticalThickness = testLayers.reduce((sum, layer) => {
          const n = getRefractiveIndex(layer.material, 550); // Use 550nm as reference
          return sum + n * layer.thickness;
        }, 0);

        if (reverseEngineerMode) {
          // For reverse engineering: moderate smoothness to match data while reducing peaks
          const smoothnessError = avgVariation * 0.2; // Lighter weight to prioritize data fit
          const peakError = peakCount * 1.5; // Moderate peak penalty
          const thicknessError = totalOpticalThickness / 5000; // Slight penalty for very thick stacks
          error = error + smoothnessError + peakError + thicknessError;
        } else {
          // For target mode: use user-defined weight if minimizePeaks is checked
          const effectiveWeight = minimizePeaks ? smoothnessWeight : 0.3;
          const smoothnessError = avgVariation * effectiveWeight;
          const peakError = peakCount * 2.0; // Heavier peak penalty for target mode
          const thicknessError = totalOpticalThickness / 3000; // Encourage thinner stacks
          error = error + smoothnessError + peakError + thicknessError;
        }
      }

      // Add adhesion layer if enabled
      const layersWithAdhesion = useAdhesionLayer
        ? [
            {
              id: -1,
              material: adhesionMaterial,
              thickness: adhesionThickness,
              iad: null,
            },
            ...testLayers,
          ]
        : testLayers;

      foundSolutions.push({ layers: layersWithAdhesion, error });

      // Track best solution
      if (!bestSolution || error < bestSolution.error) {
        bestSolution = {
          layers: JSON.parse(JSON.stringify(layersWithAdhesion)),
          error,
        };
      }
    }

    // Refinement phase: Take the top 50 solutions and refine them VERY aggressively
    setOptimizationStage("Phase 2: Fine-Tuning (This may take a few minutes)");
    setOptimizationProgress(30);
    await new Promise((resolve) => setTimeout(resolve, 0));

    foundSolutions.sort((a, b) => a.error - b.error);
    const topSolutions = foundSolutions.slice(0, 50);

    // Multi-stage refinement with decreasing step sizes
    const refinementStages = [
      { iterations: 1000, adjustmentRange: 0.3 }, // ±30%
      { iterations: 1000, adjustmentRange: 0.15 }, // ±15%
      { iterations: 500, adjustmentRange: 0.05 }, // ±5% for final precision
    ];

    for (let solIdx = 0; solIdx < topSolutions.length; solIdx++) {
      setOptimizationProgress(30 + (solIdx / topSolutions.length) * 60); // 30-90%

      let baseLayers = JSON.parse(JSON.stringify(topSolutions[solIdx].layers));

      // Multi-stage refinement
      for (const stage of refinementStages) {
        for (let refineIter = 0; refineIter < stage.iterations; refineIter++) {
          const refinedLayers = baseLayers.map((layer) => {
            // Adaptive random adjustment based on stage
            const adjustment =
              1 -
              stage.adjustmentRange +
              Math.random() * (2 * stage.adjustmentRange);
            const newThickness = Math.max(
              15,
              Math.min(300, layer.thickness * adjustment)
            );
            return { ...layer, thickness: newThickness };
          });

          // Calculate error for refined solution
          let error = 0;
          let errorCount = 0;

          if (reverseEngineerMode) {
            reverseEngineerData.forEach((dataPoint) => {
              const calcR =
                calculateReflectivityAtWavelength(
                  dataPoint.wavelength,
                  refinedLayers
                ) * 100;
              error += Math.pow(calcR - dataPoint.reflectivity, 2);
              errorCount++;
            });
          } else {
            designPoints.forEach((point) => {
              if (point.useWavelengthRange) {
                const numSamples = 5;
                const step =
                  (point.wavelengthMax - point.wavelengthMin) /
                  (numSamples - 1);
                for (let i = 0; i < numSamples; i++) {
                  const lambda = point.wavelengthMin + i * step;
                  const calcR =
                    calculateReflectivityAtWavelength(lambda, refinedLayers) *
                    100;

                  if (point.useReflectivityRange) {
                    if (calcR < point.reflectivityMin) {
                      error += Math.pow(point.reflectivityMin - calcR, 2);
                      errorCount++;
                    } else if (calcR > point.reflectivityMax) {
                      error += Math.pow(calcR - point.reflectivityMax, 2);
                      errorCount++;
                    }
                  } else {
                    const targetValue =
                      (point.reflectivityMin + point.reflectivityMax) / 2;
                    error += Math.pow(calcR - targetValue, 2);
                    errorCount++;
                  }
                }
              } else {
                const lambda = (point.wavelengthMin + point.wavelengthMax) / 2;
                const calcR =
                  calculateReflectivityAtWavelength(lambda, refinedLayers) *
                  100;

                if (point.useReflectivityRange) {
                  if (calcR < point.reflectivityMin) {
                    error += Math.pow(point.reflectivityMin - calcR, 2);
                  } else if (calcR > point.reflectivityMax) {
                    error += Math.pow(calcR - point.reflectivityMax, 2);
                  }
                } else {
                  const targetValue =
                    (point.reflectivityMin + point.reflectivityMax) / 2;
                  error += Math.pow(calcR - targetValue, 2);
                }
                errorCount++;
              }
            });
          }

          error = errorCount > 0 ? Math.sqrt(error / errorCount) : 0;

          // Add smoothness penalties (lighter during refinement)
          const { min, max, step } = wavelengthRange;
          let prevR = null;
          let smoothnessPenalty = 0;
          let smoothnessCount = 0;
          let peakCount = 0;
          let prevSlope = null;

          for (let lambda = min; lambda <= max; lambda += step * 2) {
            const calcR =
              calculateReflectivityAtWavelength(lambda, refinedLayers) * 100;

            if (prevR !== null) {
              const currentSlope = calcR - prevR;
              if (
                prevSlope !== null &&
                Math.sign(currentSlope) !== Math.sign(prevSlope) &&
                Math.abs(currentSlope) > 1
              ) {
                peakCount++;
              }
              const variation = Math.abs(calcR - prevR);
              smoothnessPenalty += Math.pow(variation, 2);
              smoothnessCount++;
              prevSlope = currentSlope;
            }
            prevR = calcR;
          }

          if (smoothnessCount > 0) {
            const avgVariation = Math.sqrt(smoothnessPenalty / smoothnessCount);
            const totalOpticalThickness = refinedLayers.reduce((sum, layer) => {
              const n = getRefractiveIndex(layer.material, 550);
              return sum + n * layer.thickness;
            }, 0);

            if (reverseEngineerMode) {
              const smoothnessError = avgVariation * 0.15;
              const peakError = peakCount * 1.0;
              const thicknessError = totalOpticalThickness / 5000;
              error = error + smoothnessError + peakError + thicknessError;
            } else {
              const effectiveWeight = minimizePeaks ? smoothnessWeight : 0.25;
              const smoothnessError = avgVariation * effectiveWeight;
              const peakError = peakCount * 1.5;
              const thicknessError = totalOpticalThickness / 3000;
              error = error + smoothnessError + peakError + thicknessError;
            }
          }

          // Don't add adhesion layer here - it's already in refinedLayers from phase 1
          foundSolutions.push({ layers: refinedLayers, error });

          // If this refinement is better, use it as new base for next iteration
          if (foundSolutions.length > 0 && error < topSolutions[solIdx].error) {
            baseLayers = JSON.parse(JSON.stringify(refinedLayers));
            topSolutions[solIdx].error = error;
          }
        }
      }
    }

    // Final sort and filter to ONLY include solutions with error < 3%
    setOptimizationStage("Phase 3: Finalizing Solutions");
    setOptimizationProgress(90);
    await new Promise((resolve) => setTimeout(resolve, 0));

    foundSolutions.sort((a, b) => a.error - b.error);

    // STRICT: Only accept solutions with error < 3%
    const excellentSolutions = foundSolutions.filter((s) => s.error < 3.0);

    let finalSolutions;
    if (excellentSolutions.length >= 5) {
      finalSolutions = excellentSolutions.slice(0, 5);
    } else if (excellentSolutions.length > 0) {
      // Return whatever excellent solutions we have, even if < 5
      finalSolutions = excellentSolutions.slice(0, 5);
      console.log(
        `Found ${excellentSolutions.length} solutions with <3% error`
      );
    } else {
      // No solutions meet the <3% criteria
      const bestError =
        foundSolutions.length > 0 ? foundSolutions[0].error.toFixed(2) : "N/A";
      alert(
        `No solutions found with error <3%. Best error achieved: ${bestError}%. Try:\n- Increasing number of layers\n- Using different materials\n- Adjusting target points\n- Running optimization again (results vary)`
      );
      setOptimizing(false);
      setOptimizationProgress(0);
      setOptimizationStage("");
      return;
    }

    // Add reflectivity data for each solution for preview charts
    const solutionsWithData = finalSolutions.map((sol, idx) => {
      const data = [];
      for (
        let wavelength = wavelengthRange.min;
        wavelength <= wavelengthRange.max;
        wavelength += wavelengthRange.step
      ) {
        const R = calculateReflectivityAtWavelength(wavelength, sol.layers);
        data.push({
          wavelength,
          reflectivity:
            displayMode === "transmission" ? (1 - R) * 100 : R * 100,
        });
      }
      return { ...sol, chartData: data, id: idx + 1 };
    });

    setOptimizationProgress(100);
    setOptimizationStage("Complete!");
    setSolutions(solutionsWithData);

    // Reset progress after a short delay
    setTimeout(() => {
      setOptimizing(false);
      setOptimizationProgress(0);
      setOptimizationStage("");
    }, 500);
  };

  const addSolutionAsStack = (solution) => {
    // Create a new layer stack with the solution layers
    const newId = Math.max(...layerStacks.map((s) => s.id), 0) + 1;
    const colors = [
      "#4f46e5",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#84cc16",
    ];

    const newLayers = solution.layers.map((l, idx) => ({ ...l, id: idx + 1 }));

    const newStack = {
      id: newId,
      machineId: currentMachineId,
      name: `Solution ${solution.id}`,
      layers: newLayers,
      visible: true,
      color: colors[(newId - 1) % colors.length],
    };

    setLayerStacks([...layerStacks, newStack]);
    setCurrentStackId(newId);
    setLayers(newLayers); // IMPORTANT: Set the layers state so they display in the editor
    prevLayersRef.current = JSON.stringify(newLayers);
    setActiveTab("designer");
  };

  // IAD Modal Component
  const IADModal = () => {
    const layer = layers.find((l) => l.id === currentIADLayer);
    if (!layer) return null;

    const currentSettings = layer.iad || getDefaultIADSettings(layer.material);
    const [iadConfig, setIADConfig] = useState(currentSettings);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              IAD Settings - Layer{" "}
              {layers.findIndex((l) => l.id === layer.id) + 1}
            </h3>
            <button
              onClick={() => setShowIADModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
            <p className="font-semibold mb-1">Material: {layer.material}</p>
            <p className="text-gray-600">
              Default RI increase:{" "}
              {materialDispersion[layer.material]?.iadIncrease || 0}%
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  checked={iadConfig.enabled}
                  onChange={(e) =>
                    setIADConfig({ ...iadConfig, enabled: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="font-medium">Enable IAD</span>
              </label>
            </div>

            {iadConfig.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ion Source Voltage (V)
                  </label>
                  <input
                    type="number"
                    value={iadConfig.voltage}
                    onChange={(e) =>
                      setIADConfig({
                        ...iadConfig,
                        voltage: safesafeParseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                    step="5"
                    min="50"
                    max="200"
                  />
                  <span className="text-xs text-gray-500">
                    Typical range: 80-150V
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ion Source Current (A)
                  </label>
                  <input
                    type="number"
                    value={iadConfig.current}
                    onChange={(e) =>
                      setIADConfig({
                        ...iadConfig,
                        current: safesafeParseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                    step="0.1"
                    min="0.1"
                    max="3.0"
                  />
                  <span className="text-xs text-gray-500">
                    Typical range: 0.5-2.0A
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    O₂ Flow Rate (sccm)
                  </label>
                  <input
                    type="number"
                    value={iadConfig.o2Flow}
                    onChange={(e) =>
                      setIADConfig({
                        ...iadConfig,
                        o2Flow: safesafeParseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                    step="0.5"
                    min="0"
                    max="20"
                  />
                  <span className="text-xs text-gray-500">
                    Typical range: 2-15 sccm
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ar Flow Rate (sccm)
                  </label>
                  <input
                    type="number"
                    value={iadConfig.arFlow}
                    onChange={(e) =>
                      setIADConfig({
                        ...iadConfig,
                        arFlow: safesafeParseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                    step="0.5"
                    min="0"
                    max="20"
                  />
                  <span className="text-xs text-gray-500">
                    Typical range: 3-10 sccm
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    RI Increase (%)
                  </label>
                  <input
                    type="number"
                    value={iadConfig.riIncrease}
                    onChange={(e) =>
                      setIADConfig({
                        ...iadConfig,
                        riIncrease: safesafeParseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                    step="0.1"
                    min="0"
                    max="10"
                  />
                  <span className="text-xs text-gray-500">
                    Material-dependent, typically 1-5%
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded text-sm">
                  <p className="font-medium mb-1">
                    Effective Refractive Index:
                  </p>
                  <p className="text-gray-700">
                    Base: {getRefractiveIndex(layer.material, 550).toFixed(4)} @
                    550nm
                  </p>
                  <p className="text-blue-600 font-medium">
                    With IAD:{" "}
                    {(
                      getRefractiveIndex(layer.material, 550) *
                      (1 + iadConfig.riIncrease / 100)
                    ).toFixed(4)}{" "}
                    @ 550nm
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex space-x-3">
            {layer.iad && (
              <button
                onClick={() => {
                  removeLayerIAD(currentIADLayer);
                  setShowIADModal(false);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove IAD
              </button>
            )}
            <button
              onClick={() => setShowIADModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => updateLayerIAD(iadConfig)}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Tabs */}
        <div className="flex gap-1 mb-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab("designer")}
            className={`px-4 py-2 rounded-t font-semibold transition-colors ${
              activeTab === "designer"
                ? "bg-white text-indigo-600 shadow"
                : "bg-indigo-100 text-gray-600 hover:bg-indigo-200"
            }`}
          >
            Thin-Film Designer
          </button>
          <button
            onClick={() => setActiveTab("assistant")}
            className={`px-4 py-2 rounded-t font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "assistant"
                ? "bg-white text-indigo-600 shadow"
                : "bg-indigo-100 text-gray-600 hover:bg-indigo-200"
            }`}
          >
            <Zap size={16} />
            Design Assistant
          </button>
          <button
            onClick={() => setActiveTab("tracking")}
            className={`px-4 py-2 rounded-t font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "tracking"
                ? "bg-white text-indigo-600 shadow"
                : "bg-indigo-100 text-gray-600 hover:bg-indigo-200"
            }`}
          >
            <Upload size={16} />
            Recipe Tracking
          </button>
          <button
            onClick={() => setActiveTab("yield")}
            className={`px-4 py-2 rounded-t font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "yield"
                ? "bg-white text-indigo-600 shadow"
                : "bg-indigo-100 text-gray-600 hover:bg-indigo-200"
            }`}
          >
            <TrendingUp size={16} />
            Yield Analysis
          </button>
        </div>

        {/* Designer Tab Content */}
        {activeTab === "designer" && (
          <>
            <div className="flex justify-between items-center mb-2 flex-shrink-0 flex-wrap gap-2">
              <h1 className="text-lg font-bold text-gray-800">
                Thin Film Coating Stack Designer
              </h1>
              <div className="flex gap-2 text-xs flex-wrap">
                <div className="bg-white px-2 py-1 rounded shadow flex items-center gap-1 flex-shrink-0">
                  <span className="text-gray-600">λ: </span>
                  <input
                    type="number"
                    value={wavelengthRange.min}
                    onChange={(e) =>
                      setWavelengthRange({
                        ...wavelengthRange,
                        min: parseInt(e.target.value),
                      })
                    }
                    className="w-12 px-1 border rounded"
                  />
                  <span className="mx-1">-</span>
                  <input
                    type="number"
                    value={wavelengthRange.max}
                    onChange={(e) =>
                      setWavelengthRange({
                        ...wavelengthRange,
                        max: parseInt(e.target.value),
                      })
                    }
                    className="w-12 px-1 border rounded"
                  />
                  <span className="ml-1">nm</span>
                </div>
                <div className="bg-white px-2 py-1 rounded shadow flex items-center gap-1 flex-shrink-0">
                  <span className="text-gray-600">Y: </span>
                  <input
                    type="number"
                    value={reflectivityRange.min}
                    onChange={(e) =>
                      setReflectivityRange({
                        ...reflectivityRange,
                        min: safesafeParseFloat(e.target.value),
                      })
                    }
                    className="w-10 px-1 border rounded"
                    disabled={autoYAxis}
                  />
                  <span className="mx-1">-</span>
                  <input
                    type="number"
                    value={reflectivityRange.max}
                    onChange={(e) =>
                      setReflectivityRange({
                        ...reflectivityRange,
                        max: safesafeParseFloat(e.target.value),
                      })
                    }
                    className="w-10 px-1 border rounded"
                    disabled={autoYAxis}
                  />
                  <span className="ml-1">%</span>
                  <label className="ml-2 flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={autoYAxis}
                      onChange={(e) => setAutoYAxis(e.target.checked)}
                      className="cursor-pointer"
                    />
                    <span className="text-xs">Auto</span>
                  </label>
                </div>
                <button
                  onClick={() => setShowTargetsModal(true)}
                  className="bg-white px-2 py-1 rounded shadow hover:bg-gray-50 flex items-center gap-1 flex-shrink-0"
                >
                  <Settings size={12} />
                  <span>Targets</span>
                </button>
                <div className="bg-white px-2 py-1 rounded shadow flex-shrink-0">
                  {!experimentalData ? (
                    <label className="cursor-pointer flex items-center gap-1">
                      <Upload size={12} />
                      <span>Upload CSV</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓ Exp Data</span>
                      {suggestions.map((s, i) => (
                        <span key={i} className="text-blue-600">
                          {s.message}
                        </span>
                      ))}
                      <button
                        onClick={clearExperimentalData}
                        className="text-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-lg p-2 flex flex-col overflow-hidden designer-container min-h-0">
              <div
                style={{ height: `${chartHeight}%` }}
                className="mb-0 min-h-0 flex gap-2"
              >
                <div className="flex-1 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reflectivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="wavelength"
                        type="number"
                        domain={[wavelengthRange.min, wavelengthRange.max]}
                        ticks={calculateXAxisTicks()}
                        label={{
                          value: "Wavelength (nm)",
                          position: "insideBottom",
                          offset: -5,
                        }}
                        tick={{ fontSize: 10 }}
                        allowDataOverflow={false}
                      />
                      <YAxis
                        label={{
                          value: `${
                            displayMode === "transmission"
                              ? "Transmission"
                              : "Reflectivity"
                          } (%)`,
                          angle: -90,
                          position: "insideLeft",
                        }}
                        domain={[reflectivityRange.min, reflectivityRange.max]}
                        ticks={calculateYAxisTicks()}
                        tick={{ fontSize: 10 }}
                        allowDataOverflow={true}
                      />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "10px" }} />

                      {targets.map((target) => (
                        <ReferenceArea
                          key={target.id}
                          x1={target.wavelengthMin}
                          x2={target.wavelengthMax}
                          y1={target.reflectivityMin}
                          y2={target.reflectivityMax}
                          fill="rgba(34, 197, 94, 0.1)"
                          stroke="rgba(34, 197, 94, 0.6)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          label={{
                            value: target.name,
                            position: "insideTopLeft",
                            fill: "#15803d",
                            fontSize: 11,
                            fontWeight: "bold",
                          }}
                        />
                      ))}

                      {layerStacks
                        .filter((s) => s.visible)
                        .map((stack) => {
                          const dataKey =
                            displayMode === "transmission"
                              ? `stack_${stack.id}_transmission`
                              : `stack_${stack.id}`;
                          return (
                            <Line
                              key={stack.id}
                              type="monotone"
                              dataKey={dataKey}
                              stroke={stack.color}
                              strokeWidth={stack.id === currentStackId ? 3 : 2}
                              dot={false}
                              name={stack.name}
                              isAnimationActive={false}
                            />
                          );
                        })}

                      {/* Factor Preview Line - only for current stack */}
                      {showFactorPreview && factorPreviewData.length > 0 && (
                        <Line
                          type="monotone"
                          data={factorPreviewData}
                          dataKey={
                            displayMode === "transmission"
                              ? "preview_transmission"
                              : "preview"
                          }
                          stroke={
                            layerStacks.find((s) => s.id === currentStackId)
                              ?.color || "#4f46e5"
                          }
                          strokeWidth={2}
                          strokeOpacity={0.4}
                          strokeDasharray="5 5"
                          dot={false}
                          name="Factor Preview"
                          isAnimationActive={false}
                        />
                      )}

                      {/* Shift Preview Line - only for current stack */}
                      {showShiftPreview && shiftPreviewData.length > 0 && (
                        <Line
                          type="monotone"
                          data={shiftPreviewData}
                          dataKey={
                            displayMode === "transmission"
                              ? "shiftPreview_transmission"
                              : "shiftPreview"
                          }
                          stroke={
                            layerStacks.find((s) => s.id === currentStackId)
                              ?.color || "#4f46e5"
                          }
                          strokeWidth={2}
                          strokeOpacity={0.3}
                          strokeDasharray="3 3"
                          dot={false}
                          name="Shift Preview"
                          isAnimationActive={false}
                        />
                      )}

                      {experimentalData && (
                        <Line
                          type="monotone"
                          dataKey={
                            displayMode === "transmission"
                              ? "experimental_transmission"
                              : "experimental"
                          }
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={false}
                          name="Experimental"
                          isAnimationActive={false}
                        />
                      )}

                      {/* Multi-Angle Lines for Current Stack */}
                      {currentStackId &&
                        layerStacks.find((s) => s.id === currentStackId)
                          ?.visible &&
                        [
                          {
                            key: "angle_15",
                            angle: 15,
                            dash: "8 4",
                            opacity: 0.7,
                          },
                          {
                            key: "angle_30",
                            angle: 30,
                            dash: "6 3",
                            opacity: 0.6,
                          },
                          {
                            key: "angle_45",
                            angle: 45,
                            dash: "4 2",
                            opacity: 0.5,
                          },
                          {
                            key: "angle_60",
                            angle: 60,
                            dash: "2 2",
                            opacity: 0.4,
                          },
                        ].map((angleData) => {
                          if (!showAngles[angleData.key]) return null;
                          const dataKey =
                            displayMode === "transmission"
                              ? `stack_${currentStackId}_${angleData.key}_transmission`
                              : `stack_${currentStackId}_${angleData.key}`;
                          const currentStack = layerStacks.find(
                            (s) => s.id === currentStackId
                          );
                          return (
                            <Line
                              key={angleData.key}
                              type="monotone"
                              dataKey={dataKey}
                              stroke={currentStack?.color || "#4f46e5"}
                              strokeWidth={1.5}
                              strokeOpacity={angleData.opacity}
                              strokeDasharray={angleData.dash}
                              dot={false}
                              name={`${currentStack?.name || "Current"} @ ${
                                angleData.angle
                              }°`}
                              isAnimationActive={false}
                            />
                          );
                        })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Enhanced Color Analysis Sidebar */}
                <div className="bg-gray-50 rounded p-2 border w-48 flex-shrink-0 flex flex-col max-h-full overflow-y-auto">
                  <div className="text-xs font-bold text-gray-800 mb-2">
                    Color Analysis
                  </div>

                  {/* Current Stack Color - Enhanced */}
                  {colorData && (
                    <div className="mb-3 pb-3 border-b border-gray-300">
                      <div className="text-[10px] text-gray-600 font-semibold mb-1.5">
                        Current Stack
                      </div>

                      {/* Larger Color Swatch */}
                      <div
                        className="w-full h-16 rounded border-2 border-gray-400 shadow-md mb-2"
                        style={{ backgroundColor: colorData.rgb }}
                        title={colorData.hex}
                      ></div>

                      {/* Color Name */}
                      <div className="text-sm font-bold text-gray-900 mb-2">
                        {colorData.colorName}
                      </div>

                      {/* CIE Lab Color Space */}
                      <div className="bg-blue-50 rounded p-1.5 mb-2">
                        <div className="text-[9px] font-semibold text-blue-800 mb-1">
                          CIE Lab
                        </div>
                        <div className="text-[10px] text-gray-700 space-y-0.5">
                          <div className="flex justify-between">
                            <span>L* (Lightness):</span>
                            <span className="font-semibold">{colorData.L}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>a* (±Red/Green):</span>
                            <span className="font-semibold">
                              {colorData.a_star}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>b* (±Yellow/Blue):</span>
                            <span className="font-semibold">
                              {colorData.b_star}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* LCh Color Space */}
                      <div className="bg-purple-50 rounded p-1.5 mb-2">
                        <div className="text-[9px] font-semibold text-purple-800 mb-1">
                          LCh (Cylindrical)
                        </div>
                        <div className="text-[10px] text-gray-700 space-y-0.5">
                          <div className="flex justify-between">
                            <span>L (Lightness):</span>
                            <span className="font-semibold">
                              {colorData.L_lch}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>C (Chroma):</span>
                            <span className="font-semibold">{colorData.C}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>h (Hue°):</span>
                            <span className="font-semibold">
                              {colorData.h}°
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Metrics */}
                      <div className="text-[10px] text-gray-700 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Dominant λ:</span>
                          <span className="font-semibold">
                            {colorData.dominantWavelength}nm
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg R:</span>
                          <span className="font-semibold">
                            {colorData.avgReflectivity}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hex:</span>
                          <span className="font-mono text-[9px]">
                            {colorData.hex}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Visible Stacks Colors - Compact */}
                  {Object.keys(stackColorData).length > 0 && (
                    <div className="mb-3 pb-3 border-b border-gray-300">
                      <div className="text-[10px] text-gray-600 font-semibold mb-1.5">
                        All Visible Stacks
                      </div>
                      <div className="space-y-2">
                        {Object.entries(stackColorData).map(
                          ([stackId, color]) => (
                            <div key={stackId} className="text-[9px]">
                              <div className="flex items-center gap-1 mb-0.5">
                                <div
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: color.stackColor }}
                                ></div>
                                <div className="font-semibold text-gray-700 truncate text-[10px]">
                                  {color.stackName}
                                </div>
                              </div>
                              <div
                                className="w-full h-8 rounded border border-gray-300 shadow-sm mb-1"
                                style={{ backgroundColor: color.rgb }}
                                title={`${color.colorName} - ${color.hex}`}
                              ></div>
                              <div className="text-gray-600 space-y-0.5 text-[9px]">
                                <div className="font-semibold">
                                  {color.colorName}
                                </div>
                                <div className="flex justify-between">
                                  <span>L*:</span>
                                  <span>{color.L}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>C:</span>
                                  <span>{color.C}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>h:</span>
                                  <span>{color.h}°</span>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Experimental Data Color */}
                  {experimentalColorData && (
                    <div className="mb-3 pb-3 border-b border-gray-300">
                      <div className="text-[10px] text-gray-600 font-semibold mb-1.5">
                        Experimental
                      </div>
                      <div
                        className="w-full h-10 rounded border-2 border-red-400 shadow-sm mb-1"
                        style={{ backgroundColor: experimentalColorData.rgb }}
                        title={experimentalColorData.hex}
                      ></div>
                      <div className="text-[10px] space-y-0.5">
                        <div className="font-semibold text-gray-900">
                          {experimentalColorData.colorName}
                        </div>
                        <div className="text-gray-700 space-y-0.5 text-[9px]">
                          <div className="flex justify-between">
                            <span>L*:</span>
                            <span>{experimentalColorData.L}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>C:</span>
                            <span>{experimentalColorData.C}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>h:</span>
                            <span>{experimentalColorData.h}°</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Multi-Angle Selector */}
                  <div className="mb-3 pb-3 border-t border-gray-300 pt-2">
                    <div className="text-[10px] font-semibold text-gray-700 mb-1.5">
                      Multi-Angle Display
                    </div>
                    <div className="space-y-1">
                      {[
                        { key: "angle_0", label: "0° (Normal)", angle: 0 },
                        { key: "angle_15", label: "15°", angle: 15 },
                        { key: "angle_30", label: "30°", angle: 30 },
                        { key: "angle_45", label: "45°", angle: 45 },
                        { key: "angle_60", label: "60°", angle: 60 },
                      ].map((angleOpt) => (
                        <label
                          key={angleOpt.key}
                          className="flex items-center gap-1 text-[10px] cursor-pointer hover:bg-gray-100 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={showAngles[angleOpt.key]}
                            onChange={(e) =>
                              setShowAngles({
                                ...showAngles,
                                [angleOpt.key]: e.target.checked,
                              })
                            }
                            className="cursor-pointer"
                          />
                          <span>{angleOpt.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 text-[9px] text-gray-500">
                      Toggle to show/hide angle curves on chart
                    </div>
                  </div>

                  {/* Display Mode Selector */}
                  <div className="mt-auto pt-2 border-t border-gray-300">
                    <div className="text-[10px] font-semibold text-gray-700 mb-1">
                      Display Mode
                    </div>
                    <select
                      value={displayMode}
                      onChange={(e) => setDisplayMode(e.target.value)}
                      className="w-full px-1.5 py-1 border rounded text-[10px] bg-white cursor-pointer"
                    >
                      <option value="reflectivity">Reflectivity</option>
                      <option value="transmission">Transmission</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Resizable Divider */}
              <div
                className="h-2 bg-gray-300 hover:bg-indigo-400 cursor-row-resize flex items-center justify-center transition-colors flex-shrink-0"
                onMouseDown={handleDividerMouseDown}
                title="Drag to resize"
              >
                <div className="w-12 h-1 bg-gray-500 rounded"></div>
              </div>

              <div
                style={{ height: `${100 - chartHeight - 1}%` }}
                className="flex flex-col overflow-hidden min-h-0"
              >
                <div className="flex justify-between items-center mb-1 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-gray-700">
                      Layer Stacks
                    </h2>
                    <button
                      onClick={addLayerStack}
                      className="px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs flex items-center gap-1"
                    >
                      <Plus size={10} /> New Stack
                    </button>
                  </div>
                  <button
                    onClick={addLayer}
                    className="px-2 py-0.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Layer
                  </button>
                </div>

                {/* Stack Tabs - show only current machine's stacks */}
                <div
                  className="flex gap-1 mb-1 overflow-x-auto pb-1 flex-shrink-0"
                  style={{ maxHeight: "30px" }}
                >
                  {layerStacks
                    .filter((s) => s.machineId === currentMachineId)
                    .map((stack) => (
                      <div
                        key={stack.id}
                        className="flex items-center gap-1 flex-shrink-0"
                      >
                        <button
                          onClick={() => switchLayerStack(stack.id)}
                          className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 whitespace-nowrap ${
                            currentStackId === stack.id
                              ? "bg-indigo-600 text-white font-semibold"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: stack.color }}
                          ></div>
                          {stack.name}
                        </button>
                        <button
                          onClick={() => toggleStackVisibility(stack.id)}
                          className={`p-0.5 rounded text-xs ${
                            stack.visible
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                          title={stack.visible ? "Hide" : "Show"}
                        >
                          {stack.visible ? "👁" : "👁‍🗨"}
                        </button>
                      </div>
                    ))}
                </div>

                {/* Machine and Stack Management */}
                <div className="mb-1 p-1 bg-gray-50 rounded border flex flex-col gap-1 flex-shrink-0">
                  {/* Machine selector row */}
                  <div className="flex gap-2 items-center">
                    <select
                      value={currentMachineId}
                      onChange={(e) => switchMachine(parseInt(e.target.value))}
                      className="flex-1 px-2 py-0.5 border rounded text-xs"
                    >
                      {machines.map((machine) => (
                        <option key={machine.id} value={machine.id}>
                          {machine.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addMachine}
                      className="px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs flex items-center gap-1"
                      title="Add new machine"
                    >
                      <Plus size={10} />
                    </button>
                    <button
                      onClick={() => deleteMachine(currentMachineId)}
                      disabled={machines.length === 1}
                      className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs disabled:bg-gray-300 disabled:cursor-not-allowed"
                      title="Delete machine"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>

                  {/* Machine and Stack name inputs row */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={
                        machines.find((m) => m.id === currentMachineId)?.name ||
                        ""
                      }
                      onChange={(e) =>
                        renameMachine(currentMachineId, e.target.value)
                      }
                      className="flex-1 px-2 py-0.5 border rounded text-xs"
                      placeholder="Machine name"
                    />
                    <input
                      type="text"
                      value={
                        layerStacks.find((s) => s.id === currentStackId)
                          ?.name || ""
                      }
                      onChange={(e) =>
                        renameLayerStack(currentStackId, e.target.value)
                      }
                      className="flex-1 px-2 py-0.5 border rounded text-xs"
                      placeholder="Stack name"
                      disabled={
                        layerStacks.filter(
                          (s) => s.machineId === currentMachineId
                        ).length === 0
                      }
                    />
                    <button
                      onClick={() => setShowToolingModal(true)}
                      className="px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs flex items-center gap-1"
                      title="Configure tooling factors for this machine"
                    >
                      <Settings size={10} />
                      Tooling
                    </button>
                    <button
                      onClick={() => {
                        calculateCoatingStress();
                        setShowStressModal(true);
                      }}
                      disabled={layers.length === 0}
                      className="px-2 py-0.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Calculate coating stress and delamination risk"
                    >
                      <Zap size={10} />
                      Stress
                    </button>
                    <button
                      onClick={() => deleteLayerStack(currentStackId)}
                      disabled={
                        layerStacks.filter(
                          (s) => s.machineId === currentMachineId
                        ).length === 0
                      }
                      className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Delete Stack
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1 bg-gray-100 p-1 rounded text-xs font-semibold text-gray-700 border-b-2 border-gray-300 flex-shrink-0">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-1 text-center">Type</div>
                  <div className="col-span-2">Material</div>
                  <div className="col-span-2">Thickness (nm)</div>
                  <div className="col-span-1 border-l-2 border-gray-400 pl-1">
                    Shift (nm)
                  </div>
                  <div className="col-span-2 border-l-2 border-gray-400 pl-1">
                    Last (nm)
                  </div>
                  <div className="col-span-2 border-l-2 border-gray-400 pl-1">
                    Original (nm)
                  </div>
                  <div className="col-span-1"></div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                  {layerStacks.filter((s) => s.machineId === currentMachineId)
                    .length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center p-8">
                      <div className="text-gray-500">
                        <p className="text-sm font-semibold mb-2">
                          No layer stacks in this machine
                        </p>
                        <p className="text-xs mb-4">
                          Click "New Stack" to create a layer stack for{" "}
                          {
                            machines.find((m) => m.id === currentMachineId)
                              ?.name
                          }
                          .
                        </p>
                        <button
                          onClick={addLayerStack}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-2 mx-auto"
                        >
                          <Plus size={16} /> Create New Stack
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-12 gap-1 p-1 bg-amber-50 border-b border-gray-200 text-xs items-center">
                        <div className="col-span-1 text-center font-medium">
                          -
                        </div>
                        <div className="col-span-1 text-center text-gray-600">
                          Sub
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={substrate.material}
                            onChange={(e) =>
                              setSubstrate({
                                ...substrate,
                                material: e.target.value,
                              })
                            }
                            className="w-full px-1 py-0.5 border rounded"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={substrate.n}
                            onChange={(e) =>
                              setSubstrate({
                                ...substrate,
                                n: safesafeParseFloat(e.target.value) || 1.52,
                              })
                            }
                            className="w-full px-1 py-0.5 border rounded"
                            step="0.01"
                            title="Substrate refractive index"
                          />
                        </div>
                        <div className="col-span-1 text-left border-l-2 border-gray-300 pl-1">
                          -
                        </div>
                        <div className="col-span-2 text-left border-l-2 border-gray-300 pl-1">
                          -
                        </div>
                        <div className="col-span-2 text-left border-l-2 border-gray-300 pl-1">
                          -
                        </div>
                        <div className="col-span-1"></div>
                      </div>

                      {/* Divider line with insert button after substrate */}
                      <div
                        className="relative border-b border-gray-300"
                        style={{ height: "1px" }}
                      >
                        <button
                          onClick={() => insertLayerAfter(-1)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 bg-white hover:bg-green-100 rounded-full text-green-600 border border-gray-300 hover:border-green-500 transition-colors shadow-sm"
                          title="Insert layer after substrate"
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      {layers.map((layer, idx) => {
                        const layerNum = idx + 1;
                        const shiftedLayers = calculateShiftedThicknesses();
                        const shiftedLayer = shiftedLayers?.find(
                          (l) => l.id === layer.id
                        );

                        return (
                          <React.Fragment key={layer.id}>
                            <div
                              className="grid grid-cols-12 gap-1 p-1 border-b border-gray-200 text-xs items-center hover:bg-gray-50"
                              style={{
                                backgroundColor:
                                  materialDispersion[layer.material].color,
                              }}
                            >
                              <div className="col-span-1 text-center font-medium">
                                {layerNum}
                              </div>
                              <div className="col-span-1 text-center text-gray-600">
                                L
                              </div>
                              <div className="col-span-2">
                                <select
                                  value={layer.material}
                                  onChange={(e) =>
                                    updateLayer(
                                      layer.id,
                                      "material",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-1 py-0.5 border rounded bg-white"
                                >
                                  {Object.keys(materialDispersion).map(
                                    (mat) => (
                                      <option key={mat} value={mat}>
                                        {mat}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="number"
                                  value={
                                    layer.thickness === ""
                                      ? ""
                                      : layer.thickness
                                  }
                                  onChange={(e) =>
                                    updateLayer(
                                      layer.id,
                                      "thickness",
                                      e.target.value
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (
                                      e.target.value === "" ||
                                      e.target.value === null
                                    ) {
                                      updateLayer(layer.id, "thickness", 100);
                                    }
                                  }}
                                  className="w-full px-1 py-0.5 border rounded"
                                  step="1"
                                />
                              </div>
                              <div className="col-span-1 text-left text-gray-600 text-[10px] border-l-2 border-gray-300 pl-1">
                                {shiftedLayer ? (
                                  <span className="font-semibold text-blue-600">
                                    {shiftedLayer.shiftedThickness.toFixed(1)}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </div>
                              <div className="col-span-2 text-left text-gray-600 text-[10px] border-l-2 border-gray-300 pl-1">
                                {layer.lastThickness
                                  ? layer.lastThickness.toFixed(2)
                                  : "-"}
                              </div>
                              <div className="col-span-2 text-left text-gray-600 text-[10px] border-l-2 border-gray-300 pl-1">
                                {layer.originalThickness
                                  ? layer.originalThickness.toFixed(2)
                                  : "-"}
                              </div>
                              <div className="col-span-1 text-center flex justify-center gap-0.5">
                                <button
                                  onClick={() => openIADModal(layer.id)}
                                  className={`p-0.5 rounded transition-colors ${
                                    layer.iad && layer.iad.enabled
                                      ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                      : "hover:bg-gray-100 text-gray-400"
                                  }`}
                                  title="IAD Settings"
                                >
                                  <Zap size={12} />
                                </button>
                                <button
                                  onClick={() => removeLayer(layer.id)}
                                  className="p-0.5 hover:bg-red-100 rounded text-red-600"
                                  disabled={layers.length === 1}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Divider line with insert button */}
                            <div
                              className="relative border-b border-gray-300"
                              style={{ height: "1px" }}
                            >
                              <button
                                onClick={() => insertLayerAfter(idx)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 bg-white hover:bg-green-100 rounded-full text-green-600 border border-gray-300 hover:border-green-500 transition-colors shadow-sm"
                                title={`Insert layer after layer ${layerNum}`}
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </React.Fragment>
                        );
                      })}

                      <div className="grid grid-cols-12 gap-1 p-1 bg-sky-50 border-b border-gray-200 text-xs items-center">
                        <div className="col-span-1 text-center font-medium">
                          -
                        </div>
                        <div className="col-span-1 text-center text-gray-600">
                          Inc
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={incident.material}
                            onChange={(e) =>
                              setIncident({
                                ...incident,
                                material: e.target.value,
                              })
                            }
                            className="w-full px-1 py-0.5 border rounded"
                          />
                        </div>
                        <div className="col-span-2 text-center">-</div>
                        <div className="col-span-1 text-left border-l-2 border-gray-300 pl-1">
                          -
                        </div>
                        <div className="col-span-2 text-left border-l-2 border-gray-300 pl-1">
                          -
                        </div>
                        <div className="col-span-2 text-left border-l-2 border-gray-300 pl-1">
                          -
                        </div>
                        <div className="col-span-1"></div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Stack Summary and Factor Controls at bottom - Compact */}
              <div className="bg-gray-50 rounded p-1.5 border mt-2 flex-shrink-0">
                <div className="text-xs text-gray-600 flex justify-between items-center gap-4">
                  <div className="flex gap-4">
                    <span>Layers: {layers.length}</span>
                    <span>
                      Total:{" "}
                      {layers
                        .reduce(
                          (sum, l) => sum + (parseFloat(l.thickness) || 0),
                          0
                        )
                        .toFixed(1)}{" "}
                      nm
                    </span>
                    <span>
                      Range: {wavelengthRange.min}-{wavelengthRange.max} nm
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Factor Controls */}
                    <div className="flex items-center gap-2 border-r pr-4">
                      <label className="font-semibold text-gray-700">
                        Factor:
                      </label>
                      <input
                        type="number"
                        value={layerFactor}
                        onChange={(e) => setLayerFactor(e.target.value)}
                        className="w-16 px-1 py-0.5 border rounded"
                        step="0.1"
                        min="0"
                      />
                      <select
                        value={layerFactorMode}
                        onChange={(e) => setLayerFactorMode(e.target.value)}
                        className="px-1 py-0.5 border rounded bg-white"
                      >
                        <option value="all">All</option>
                        <option value="odd">Odd</option>
                        <option value="even">Even</option>
                      </select>
                      <button
                        onClick={applyFactorToLayers}
                        className="px-2 py-0.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Shift Controls */}
                    <div className="flex items-center gap-2 border-r pr-4">
                      <label className="font-semibold text-gray-700">
                        Shift:
                      </label>
                      <input
                        type="number"
                        value={shiftValue}
                        onChange={(e) => setShiftValue(e.target.value)}
                        className="w-16 px-1 py-0.5 border rounded"
                        step="1"
                      />
                      <select
                        value={shiftMode}
                        onChange={(e) => setShiftMode(e.target.value)}
                        className="px-1 py-0.5 border rounded bg-white"
                      >
                        <option value="left-right">Left/Right</option>
                        <option value="up-down">Up/Down</option>
                      </select>
                      <button
                        onClick={applyShift}
                        className="px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                        disabled={
                          shiftMode === "up-down" ||
                          parseFloat(shiftValue) === 0
                        }
                      >
                        Apply
                      </button>
                    </div>

                    {/* Reset and Undo Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={undoLastChange}
                        className="px-3 py-0.5 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium"
                        disabled={
                          !layers.some((l) => l.lastThickness !== undefined)
                        }
                      >
                        Undo
                      </button>
                      <button
                        onClick={resetToOriginal}
                        className="px-3 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                        disabled={
                          !layers.some((l) => l.originalThickness !== undefined)
                        }
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Design Assistant Tab Content */}
        {activeTab === "assistant" && (
          <div className="flex-1 bg-white rounded-lg shadow-lg p-4 overflow-hidden flex flex-col min-h-0">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Design Assistant
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Define target reflectivity points or upload a CSV file to reverse
              engineer a layer stack.
            </p>

            {/* Mode Selection */}
            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!reverseEngineerMode}
                    onChange={() => setReverseEngineerMode(false)}
                    className="cursor-pointer"
                  />
                  <span className="text-sm font-medium">Target Point Mode</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={reverseEngineerMode}
                    onChange={() => setReverseEngineerMode(true)}
                    className="cursor-pointer"
                  />
                  <span className="text-sm font-medium">
                    Reverse Engineer CSV
                  </span>
                </label>
              </div>

              {reverseEngineerMode && (
                <div className="mt-3 p-2 bg-white rounded border">
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">
                    Upload Reflectivity CSV:
                  </label>
                  {!reverseEngineerData ? (
                    <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-fit">
                      <Upload size={14} />
                      <span className="text-sm">Choose CSV File</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleReverseEngineerUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">
                        ✓ Loaded {reverseEngineerData.length} data points
                      </span>
                      <button
                        onClick={clearReverseEngineerData}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs flex items-center gap-1"
                      >
                        <X size={12} />
                        Clear
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-500 mt-2">
                    CSV format: wavelength (nm), reflectivity (%)
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden min-h-0">
              {/* Left: Configuration */}
              <div className="flex flex-col overflow-hidden min-h-0">
                <div className="bg-gray-50 p-3 rounded mb-3 flex-shrink-0">
                  <h3 className="text-sm font-semibold mb-2">
                    Design Parameters
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-600">
                        Number of Layers:
                      </label>
                      <input
                        type="number"
                        value={designLayers}
                        onChange={(e) =>
                          setDesignLayers(parseInt(e.target.value) || 3)
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                        min="1"
                        max="20"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">
                        Materials to Use:
                      </label>
                      <div className="grid grid-cols-3 gap-1 mt-1">
                        {Object.keys(materialDispersion)
                          .filter((m) => m !== "Custom")
                          .map((mat) => (
                            <label
                              key={mat}
                              className="flex items-center gap-1 text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={designMaterials.includes(mat)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDesignMaterials([
                                      ...designMaterials,
                                      mat,
                                    ]);
                                  } else {
                                    setDesignMaterials(
                                      designMaterials.filter((m) => m !== mat)
                                    );
                                  }
                                }}
                              />
                              {mat}
                            </label>
                          ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <label className="flex items-center gap-2 text-xs font-medium mb-2">
                        <input
                          type="checkbox"
                          checked={minimizePeaks}
                          onChange={(e) => setMinimizePeaks(e.target.checked)}
                          className="cursor-pointer"
                        />
                        Minimize Reflectivity Peaks
                      </label>
                      {minimizePeaks && (
                        <div className="ml-5">
                          <label className="text-xs text-gray-600">
                            Smoothness Weight (0-1):
                          </label>
                          <input
                            type="number"
                            value={smoothnessWeight}
                            onChange={(e) =>
                              setSmoothnessWeight(
                                safesafeParseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                            min="0"
                            max="1"
                            step="0.1"
                          />
                          <p className="text-[10px] text-gray-500 mt-1">
                            Higher values prioritize smoother curves over target
                            accuracy
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="pt-2 border-t">
                      <label className="flex items-center gap-2 text-xs font-medium mb-2">
                        <input
                          type="checkbox"
                          checked={useAdhesionLayer}
                          onChange={(e) =>
                            setUseAdhesionLayer(e.target.checked)
                          }
                          className="cursor-pointer"
                        />
                        Add Adhesion Layer
                      </label>
                      {useAdhesionLayer && (
                        <div className="ml-5 space-y-2">
                          <div>
                            <label className="text-xs text-gray-600">
                              Material:
                            </label>
                            <select
                              value={adhesionMaterial}
                              onChange={(e) =>
                                setAdhesionMaterial(e.target.value)
                              }
                              className="w-full px-2 py-1 border rounded text-sm bg-white"
                            >
                              {Object.keys(materialDispersion)
                                .filter((m) => m !== "Custom")
                                .map((mat) => (
                                  <option key={mat} value={mat}>
                                    {mat}
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">
                              Thickness (nm):
                            </label>
                            <input
                              type="number"
                              value={adhesionThickness}
                              onChange={(e) =>
                                setAdhesionThickness(
                                  safesafeParseFloat(e.target.value) || 10
                                )
                              }
                              className="w-full px-2 py-1 border rounded text-sm"
                              min="1"
                              max="100"
                              step="1"
                            />
                          </div>
                          <p className="text-[10px] text-gray-500">
                            Adhesion layer will be added as the first layer in
                            all solutions
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                  {!reverseEngineerMode && (
                    <>
                      <h3 className="text-sm font-semibold mb-2">
                        Target Specifications
                      </h3>
                      <div className="space-y-2">
                        {designPoints.map((point) => (
                          <div
                            key={point.id}
                            className="p-3 bg-gray-50 rounded border"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-semibold text-gray-700">
                                Target #{designPoints.indexOf(point) + 1}
                              </span>
                              <button
                                onClick={() => removeDesignPoint(point.id)}
                                className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                <X size={14} />
                              </button>
                            </div>

                            {/* Wavelength Section */}
                            <div className="mb-3 p-2 bg-white rounded border">
                              <div className="mb-2">
                                <label className="flex items-center gap-2 text-xs font-medium">
                                  <input
                                    type="checkbox"
                                    checked={point.useWavelengthRange}
                                    onChange={(e) =>
                                      updateDesignPoint(
                                        point.id,
                                        "useWavelengthRange",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  Wavelength Range
                                </label>
                              </div>
                              {point.useWavelengthRange ? (
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <label className="text-xs text-gray-600">
                                      λ Min (nm)
                                    </label>
                                    <input
                                      type="number"
                                      value={point.wavelengthMin}
                                      onChange={(e) => {
                                        const val =
                                          e.target.value === ""
                                            ? ""
                                            : e.target.value;
                                        updateDesignPoint(
                                          point.id,
                                          "wavelengthMin",
                                          val
                                        );
                                      }}
                                      onBlur={(e) => {
                                        if (e.target.value === "") {
                                          updateDesignPoint(
                                            point.id,
                                            "wavelengthMin",
                                            0
                                          );
                                        }
                                      }}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                      step="1"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-xs text-gray-600">
                                      λ Max (nm)
                                    </label>
                                    <input
                                      type="number"
                                      value={point.wavelengthMax}
                                      onChange={(e) => {
                                        const val =
                                          e.target.value === ""
                                            ? ""
                                            : e.target.value;
                                        updateDesignPoint(
                                          point.id,
                                          "wavelengthMax",
                                          val
                                        );
                                      }}
                                      onBlur={(e) => {
                                        if (e.target.value === "") {
                                          updateDesignPoint(
                                            point.id,
                                            "wavelengthMax",
                                            0
                                          );
                                        }
                                      }}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                      step="1"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <label className="text-xs text-gray-600">
                                    Wavelength (nm)
                                  </label>
                                  <input
                                    type="number"
                                    value={point.wavelengthMin}
                                    onChange={(e) => {
                                      const newValue =
                                        e.target.value === ""
                                          ? 0
                                          : Number(e.target.value);
                                      setDesignPoints(
                                        designPoints.map((p) =>
                                          p.id === point.id
                                            ? {
                                                ...p,
                                                wavelengthMin: newValue,
                                                wavelengthMax: newValue,
                                              }
                                            : p
                                        )
                                      );
                                    }}
                                    className="w-full px-2 py-1 border rounded text-sm"
                                    step="1"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Reflectivity Section */}
                            <div className="p-2 bg-white rounded border">
                              <div className="mb-2">
                                <label className="flex items-center gap-2 text-xs font-medium">
                                  <input
                                    type="checkbox"
                                    checked={point.useReflectivityRange}
                                    onChange={(e) =>
                                      updateDesignPoint(
                                        point.id,
                                        "useReflectivityRange",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  Reflectivity Range
                                </label>
                              </div>
                              {point.useReflectivityRange ? (
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <label className="text-xs text-gray-600">
                                      R Min (%)
                                    </label>
                                    <input
                                      type="number"
                                      value={point.reflectivityMin}
                                      onChange={(e) => {
                                        const val =
                                          e.target.value === ""
                                            ? ""
                                            : e.target.value;
                                        updateDesignPoint(
                                          point.id,
                                          "reflectivityMin",
                                          val
                                        );
                                      }}
                                      onBlur={(e) => {
                                        if (e.target.value === "") {
                                          updateDesignPoint(
                                            point.id,
                                            "reflectivityMin",
                                            0
                                          );
                                        }
                                      }}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                      step="1"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-xs text-gray-600">
                                      R Max (%)
                                    </label>
                                    <input
                                      type="number"
                                      value={point.reflectivityMax}
                                      onChange={(e) => {
                                        const val =
                                          e.target.value === ""
                                            ? ""
                                            : e.target.value;
                                        updateDesignPoint(
                                          point.id,
                                          "reflectivityMax",
                                          val
                                        );
                                      }}
                                      onBlur={(e) => {
                                        if (e.target.value === "") {
                                          updateDesignPoint(
                                            point.id,
                                            "reflectivityMax",
                                            0
                                          );
                                        }
                                      }}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                      step="1"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <label className="text-xs text-gray-600">
                                    Target R (%)
                                  </label>
                                  <input
                                    type="number"
                                    value={point.reflectivityMin}
                                    onChange={(e) => {
                                      const newValue =
                                        e.target.value === ""
                                          ? 0
                                          : Number(e.target.value);
                                      setDesignPoints(
                                        designPoints.map((p) =>
                                          p.id === point.id
                                            ? {
                                                ...p,
                                                reflectivityMin: newValue,
                                                reflectivityMax: newValue,
                                              }
                                            : p
                                        )
                                      );
                                    }}
                                    className="w-full px-2 py-1 border rounded text-sm"
                                    step="1"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={addDesignPoint}
                        className="mt-2 w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-1"
                      >
                        <Plus size={14} /> Add Target Specification
                      </button>
                    </>
                  )}

                  {reverseEngineerMode && (
                    <div className="text-center text-gray-500 text-sm py-8">
                      {reverseEngineerData ? (
                        <div className="space-y-2">
                          <p className="font-semibold text-gray-700">
                            Ready to reverse engineer!
                          </p>
                          <p>
                            Loaded {reverseEngineerData.length} reflectivity
                            measurements
                          </p>
                          <p className="text-xs">
                            Configure materials and layers, then click "Generate
                            Solutions"
                          </p>
                        </div>
                      ) : (
                        <p>
                          Upload a CSV file with reflectivity data to begin
                          reverse engineering.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={optimizeDesign}
                  disabled={
                    optimizing ||
                    (!reverseEngineerMode && designPoints.length === 0) ||
                    (reverseEngineerMode && !reverseEngineerData) ||
                    designMaterials.length === 0
                  }
                  className="mt-3 w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-shrink-0"
                >
                  {optimizing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Generate Solutions
                    </>
                  )}
                </button>

                {/* Progress Bar */}
                {optimizing && (
                  <div className="mt-2 flex-shrink-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">
                        {optimizationStage}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600">
                        {Math.round(optimizationProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${optimizationProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      This may take 1-3 minutes for best results (&lt;3% error)
                    </p>
                  </div>
                )}
              </div>

              {/* Right: Solutions */}
              <div className="flex flex-col overflow-hidden min-h-0">
                <h3 className="text-sm font-semibold mb-2 flex-shrink-0">
                  Solutions (Top 5, Target Error &lt; 3%)
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                  {solutions.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      No solutions yet. Configure parameters and click "Generate
                      Solutions".
                    </div>
                  ) : (
                    solutions.map((solution, idx) => (
                      <div key={idx} className="p-3 border rounded bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-sm">
                            Solution {idx + 1}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              solution.error < 3
                                ? "bg-green-100 text-green-700"
                                : solution.error < 5
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {solution.error < 3 ? "✓ " : ""}
                            {solution.error.toFixed(2)}% error
                          </span>
                        </div>

                        {/* Preview Chart */}
                        {solution.chartData && (
                          <div className="mb-2 bg-white p-2 rounded border">
                            <ResponsiveContainer width="100%" height={120}>
                              <LineChart data={solution.chartData}>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#e5e7eb"
                                />
                                <XAxis
                                  dataKey="wavelength"
                                  tick={{ fontSize: 8 }}
                                  stroke="#9ca3af"
                                />
                                <YAxis
                                  domain={[
                                    0,
                                    (dataMax) => {
                                      // Find maximum reflectivity in the visible spectrum (380-780nm)
                                      const visibleData =
                                        solution.chartData.filter(
                                          (d) =>
                                            d.wavelength >= 380 &&
                                            d.wavelength <= 780
                                        );
                                      const maxReflectivity = Math.max(
                                        ...visibleData.map(
                                          (d) => d.reflectivity
                                        )
                                      );
                                      // Add 10% padding to the max value, round up to nearest 5
                                      const paddedMax =
                                        Math.ceil((maxReflectivity * 1.1) / 5) *
                                        5;
                                      return Math.max(paddedMax, 10); // Minimum of 10 to avoid too compressed charts
                                    },
                                  ]}
                                  tick={{ fontSize: 8 }}
                                  stroke="#9ca3af"
                                />
                                <Tooltip
                                  contentStyle={{ fontSize: "10px" }}
                                  labelStyle={{ fontSize: "10px" }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="reflectivity"
                                  stroke="#4f46e5"
                                  strokeWidth={2}
                                  dot={false}
                                  name={
                                    displayMode === "transmission"
                                      ? "T (%)"
                                      : "R (%)"
                                  }
                                />
                                {/* Overlay target points or experimental data */}
                                {reverseEngineerMode &&
                                  reverseEngineerData &&
                                  reverseEngineerData.map((point, i) => {
                                    if (i % 5 === 0) {
                                      // Show every 5th point to avoid clutter
                                      return (
                                        <ReferenceArea
                                          key={i}
                                          x1={point.wavelength - 3}
                                          x2={point.wavelength + 3}
                                          y1={point.reflectivity - 2}
                                          y2={point.reflectivity + 2}
                                          fill="#ef4444"
                                          fillOpacity={0.2}
                                        />
                                      );
                                    }
                                    return null;
                                  })}
                                {!reverseEngineerMode &&
                                  designPoints.map((point, i) => (
                                    <ReferenceArea
                                      key={i}
                                      x1={point.wavelengthMin}
                                      x2={
                                        point.wavelengthMax ||
                                        point.wavelengthMin
                                      }
                                      y1={point.reflectivityMin}
                                      y2={
                                        point.reflectivityMax ||
                                        point.reflectivityMin
                                      }
                                      fill="#10b981"
                                      fillOpacity={0.2}
                                    />
                                  ))}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        <div className="space-y-1 mb-2">
                          {solution.layers.map((layer, lidx) => (
                            <div
                              key={lidx}
                              className="text-xs flex justify-between"
                              style={{
                                backgroundColor:
                                  materialDispersion[layer.material].color,
                                padding: "2px 4px",
                                borderRadius: "2px",
                              }}
                            >
                              <span>
                                Layer {lidx + 1}: {layer.material}
                              </span>
                              <span>{layer.thickness.toFixed(1)} nm</span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => addSolutionAsStack(solution)}
                          className="w-full py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-semibold"
                        >
                          Add Stack
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Tracking Tab Content */}
        {activeTab === "tracking" && (
          <div className="bg-white rounded-lg shadow-lg p-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-3 flex-shrink-0">
              <h1 className="text-lg font-bold text-gray-800">
                Recipe Tracking & Trend Analysis
              </h1>
              {trackingRuns.length > 0 && (
                <button
                  onClick={clearAllTrackingRuns}
                  className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 text-sm flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Clear All
                </button>
              )}
            </div>

            {trackingRuns.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold mb-2">
                    No tracking data uploaded
                  </p>
                  <p className="text-sm mb-4">
                    Select a machine and recipe, then upload CSV files for INT
                    (top) or EXT (bottom) lens positions.
                  </p>
                  <p className="text-xs text-gray-400">
                    Expected format: wavelength (nm), reflectivity (%)
                  </p>

                  {/* Selection Controls for Empty State */}
                  <div className="mt-6 max-w-md mx-auto bg-gray-50 rounded border p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block text-left">
                          Machine:
                        </label>
                        <select
                          value={selectedMachineForTracking || ""}
                          onChange={(e) =>
                            setSelectedMachineForTracking(
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        >
                          <option value="">Select Machine...</option>
                          {machines.map((machine) => (
                            <option key={machine.id} value={machine.id}>
                              {machine.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block text-left">
                          Recipe:
                        </label>
                        <select
                          value={selectedRecipeForTracking || ""}
                          onChange={(e) =>
                            setSelectedRecipeForTracking(
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        >
                          <option value="">Select Recipe...</option>
                          {recipes.map((recipe) => (
                            <option key={recipe.id} value={recipe.id}>
                              {recipe.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-2">
                        <label className="text-xs font-semibold text-gray-700 mb-1 block text-left">
                          Upload Data:
                        </label>
                        <div className="flex gap-2">
                          <label
                            className={`flex-1 px-3 py-2 rounded text-sm font-medium text-center cursor-pointer ${
                              selectedMachineForTracking &&
                              selectedRecipeForTracking
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            INT (Top)
                            <input
                              type="file"
                              multiple
                              accept=".csv"
                              onChange={(e) =>
                                handleTrackingFileUpload(e, "INT")
                              }
                              className="hidden"
                              disabled={
                                !selectedMachineForTracking ||
                                !selectedRecipeForTracking
                              }
                            />
                          </label>
                          <label
                            className={`flex-1 px-3 py-2 rounded text-sm font-medium text-center cursor-pointer ${
                              selectedMachineForTracking &&
                              selectedRecipeForTracking
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            EXT (Bottom)
                            <input
                              type="file"
                              multiple
                              accept=".csv"
                              onChange={(e) =>
                                handleTrackingFileUpload(e, "EXT")
                              }
                              className="hidden"
                              disabled={
                                !selectedMachineForTracking ||
                                !selectedRecipeForTracking
                              }
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden flex gap-3">
                {/* Left Panel - Controls and Runs List */}
                <div className="w-48 flex-shrink-0 flex flex-col gap-2 overflow-hidden">
                  {/* Selection and Upload Controls */}
                  <div className="p-2 bg-gray-50 rounded border flex-shrink-0">
                    <h3 className="text-xs font-bold text-gray-700 mb-2">
                      Upload Data
                    </h3>
                    <div className="space-y-1.5">
                      <div>
                        <label className="text-[10px] font-medium text-gray-600 mb-0.5 block">
                          Machine:
                        </label>
                        <select
                          value={selectedMachineForTracking || ""}
                          onChange={(e) =>
                            setSelectedMachineForTracking(
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-1.5 py-0.5 border rounded text-xs"
                        >
                          <option value="">Select...</option>
                          {machines.map((machine) => (
                            <option key={machine.id} value={machine.id}>
                              {machine.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-medium text-gray-600 mb-0.5 block">
                          Recipe:
                        </label>
                        <select
                          value={selectedRecipeForTracking || ""}
                          onChange={(e) =>
                            setSelectedRecipeForTracking(
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-1.5 py-0.5 border rounded text-xs"
                        >
                          <option value="">Select...</option>
                          {recipes.map((recipe) => (
                            <option key={recipe.id} value={recipe.id}>
                              {recipe.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-medium text-gray-600 mb-0.5 block">
                          Run Number:
                        </label>
                        <input
                          type="text"
                          value={runNumber}
                          onChange={(e) => setRunNumber(e.target.value)}
                          className="w-full px-1.5 py-0.5 border rounded text-xs"
                          placeholder="Optional..."
                        />
                      </div>

                      <div className="flex gap-1 pt-1">
                        <label
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium text-center cursor-pointer ${
                            selectedMachineForTracking &&
                            selectedRecipeForTracking
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          INT
                          <input
                            type="file"
                            multiple
                            accept=".csv"
                            onChange={(e) => handleTrackingFileUpload(e, "INT")}
                            className="hidden"
                            disabled={
                              !selectedMachineForTracking ||
                              !selectedRecipeForTracking
                            }
                          />
                        </label>
                        <label
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium text-center cursor-pointer ${
                            selectedMachineForTracking &&
                            selectedRecipeForTracking
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          EXT
                          <input
                            type="file"
                            multiple
                            accept=".csv"
                            onChange={(e) => handleTrackingFileUpload(e, "EXT")}
                            className="hidden"
                            disabled={
                              !selectedMachineForTracking ||
                              !selectedRecipeForTracking
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="p-2 bg-gray-50 rounded border flex-shrink-0">
                    <h3 className="text-xs font-bold text-gray-700 mb-2">
                      Filters
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-medium text-gray-600 mb-0.5 block">
                          Machine:
                        </label>
                        <select
                          value={trackingFilters.machine}
                          onChange={(e) =>
                            updateTrackingFilter(
                              "machine",
                              e.target.value === "all"
                                ? "all"
                                : parseInt(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1 border rounded text-xs"
                        >
                          <option value="all">All</option>
                          {Array.from(
                            new Set(trackingRuns.map((r) => r.machineId))
                          ).map((machineId) => {
                            const machine = machines.find(
                              (m) => m.id === machineId
                            );
                            return machine ? (
                              <option key={machineId} value={machineId}>
                                {machine.name}
                              </option>
                            ) : null;
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-medium text-gray-600 mb-0.5 block">
                          Recipe:
                        </label>
                        <select
                          value={trackingFilters.recipe}
                          onChange={(e) =>
                            updateTrackingFilter(
                              "recipe",
                              e.target.value === "all"
                                ? "all"
                                : parseInt(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1 border rounded text-xs"
                        >
                          <option value="all">All</option>
                          {Array.from(
                            new Set(trackingRuns.map((r) => r.recipeId))
                          ).map((recipeId) => {
                            const recipe = recipes.find(
                              (r) => r.id === recipeId
                            );
                            return recipe ? (
                              <option key={recipeId} value={recipeId}>
                                {recipe.name}
                              </option>
                            ) : null;
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-medium text-gray-600 mb-0.5 block">
                          Position:
                        </label>
                        <select
                          value={trackingFilters.placement}
                          onChange={(e) =>
                            updateTrackingFilter("placement", e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded text-xs"
                        >
                          <option value="all">All</option>
                          <option value="INT">INT</option>
                          <option value="EXT">EXT</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Runs List */}
                  <div className="flex-1 overflow-hidden flex flex-col p-2 bg-gray-50 rounded border">
                    {(() => {
                      const filteredRuns = trackingRuns.filter((run) => {
                        if (
                          trackingFilters.machine !== "all" &&
                          run.machineId !== trackingFilters.machine
                        )
                          return false;
                        if (
                          trackingFilters.recipe !== "all" &&
                          run.recipeId !== trackingFilters.recipe
                        )
                          return false;
                        if (
                          trackingFilters.placement !== "all" &&
                          run.placement !== trackingFilters.placement
                        )
                          return false;
                        return true;
                      });

                      return (
                        <>
                          <h3 className="text-xs font-bold text-gray-700 mb-1 flex-shrink-0">
                            Runs ({filteredRuns.length}/{trackingRuns.length})
                          </h3>
                          <div className="flex-1 overflow-y-auto space-y-1">
                            {filteredRuns.map((run) => (
                              <div
                                key={run.id}
                                className="flex items-start justify-between p-1.5 border rounded bg-white hover:bg-gray-50 text-xs"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <span
                                      className={`px-1 py-0.5 rounded text-[9px] font-bold flex-shrink-0 ${
                                        run.placement === "INT"
                                          ? "bg-blue-200 text-blue-800"
                                          : "bg-green-200 text-green-800"
                                      }`}
                                    >
                                      {run.placement}
                                    </span>
                                    <span className="truncate text-[10px] font-medium">
                                      {run.filename}
                                    </span>
                                  </div>
                                  <div className="text-[9px] text-gray-500 truncate">
                                    {run.machineName} | {run.recipeName}
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteTrackingRun(run.id)}
                                  className="ml-1 p-0.5 text-red-600 hover:bg-red-100 rounded flex-shrink-0"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Center Panel - Chart */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex-1 bg-white border rounded p-2">
                    {trackingStats &&
                      (() => {
                        const filteredRuns = trackingRuns.filter((run) => {
                          if (
                            trackingFilters.machine !== "all" &&
                            run.machineId !== trackingFilters.machine
                          )
                            return false;
                          if (
                            trackingFilters.recipe !== "all" &&
                            run.recipeId !== trackingFilters.recipe
                          )
                            return false;
                          if (
                            trackingFilters.placement !== "all" &&
                            run.placement !== trackingFilters.placement
                          )
                            return false;
                          return true;
                        });

                        return (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trackingStats}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="wavelength"
                                type="number"
                                domain={["dataMin", "dataMax"]}
                                label={{
                                  value: "Wavelength (nm)",
                                  position: "insideBottom",
                                  offset: -5,
                                  style: { fontSize: 12 },
                                }}
                              />
                              <YAxis
                                label={{
                                  value: "Reflectivity (%)",
                                  angle: -90,
                                  position: "insideLeft",
                                  style: { fontSize: 12 },
                                }}
                              />
                              <Tooltip />
                              <Legend />

                              {/* Plot each filtered run */}
                              {filteredRuns.map((run, idx) => (
                                <Line
                                  key={run.id}
                                  type="monotone"
                                  dataKey={`run${idx}`}
                                  stroke={`hsl(${
                                    (idx * 360) / filteredRuns.length
                                  }, 70%, 50%)`}
                                  name={`${
                                    run.placement
                                  } - ${run.filename.substring(0, 15)}...`}
                                  dot={false}
                                  strokeWidth={1.5}
                                  opacity={0.6}
                                  connectNulls
                                />
                              ))}

                              {/* Plot mean with thicker line */}
                              <Line
                                type="monotone"
                                dataKey="mean"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                name="Mean"
                                dot={false}
                              />

                              {/* Plot standard deviation bounds */}
                              <Line
                                type="monotone"
                                dataKey="upperBound"
                                stroke="#9ca3af"
                                strokeWidth={1}
                                strokeDasharray="5 5"
                                name="Mean + σ"
                                dot={false}
                              />
                              <Line
                                type="monotone"
                                dataKey="lowerBound"
                                stroke="#9ca3af"
                                strokeWidth={1}
                                strokeDasharray="5 5"
                                name="Mean - σ"
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        );
                      })()}
                  </div>
                </div>

                {/* Right Panel - Statistics */}
                <div className="w-44 flex-shrink-0 flex flex-col gap-2">
                  {/* Save Data Button */}
                  <button
                    onClick={saveTrackingData}
                    className="px-2 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <Upload size={12} />
                    Save Data
                  </button>

                  {trackingStats &&
                    trackingStats.length > 0 &&
                    (() => {
                      const filteredRuns = trackingRuns.filter((run) => {
                        if (
                          trackingFilters.machine !== "all" &&
                          run.machineId !== trackingFilters.machine
                        )
                          return false;
                        if (
                          trackingFilters.recipe !== "all" &&
                          run.recipeId !== trackingFilters.recipe
                        )
                          return false;
                        if (
                          trackingFilters.placement !== "all" &&
                          run.placement !== trackingFilters.placement
                        )
                          return false;
                        return true;
                      });

                      return (
                        <div className="p-1.5 bg-gray-50 rounded border flex-1 overflow-y-auto">
                          <h3 className="text-xs font-bold text-gray-700 mb-1.5">
                            Statistics
                          </h3>
                          <div className="space-y-1.5">
                            <div className="p-1.5 border rounded bg-blue-50">
                              <div className="text-[9px] text-gray-600">
                                Filtered
                              </div>
                              <div className="text-base font-bold text-blue-700">
                                {filteredRuns.length}
                                <span className="text-xs text-gray-500">
                                  /{trackingRuns.length}
                                </span>
                              </div>
                            </div>
                            <div className="p-1.5 border rounded bg-green-50">
                              <div className="text-[9px] text-gray-600">
                                Avg. Std Dev
                              </div>
                              <div className="text-base font-bold text-green-700">
                                {(
                                  trackingStats
                                    .filter((s) => s.stdDev !== undefined)
                                    .reduce((sum, s) => sum + s.stdDev, 0) /
                                  trackingStats.filter(
                                    (s) => s.stdDev !== undefined
                                  ).length
                                ).toFixed(2)}
                                %
                              </div>
                            </div>
                            <div className="p-1.5 border rounded bg-yellow-50">
                              <div className="text-[9px] text-gray-600">
                                Max Variation
                              </div>
                              <div className="text-base font-bold text-yellow-700">
                                {Math.max(
                                  ...trackingStats
                                    .filter(
                                      (s) =>
                                        s.max !== undefined &&
                                        s.min !== undefined
                                    )
                                    .map((s) => s.max - s.min)
                                ).toFixed(2)}
                                %
                              </div>
                            </div>
                            <div className="p-1.5 border rounded bg-purple-50">
                              <div className="text-[9px] text-gray-600">
                                λ Range
                              </div>
                              <div className="text-sm font-bold text-purple-700">
                                {Math.min(
                                  ...trackingStats.map((s) => s.wavelength)
                                ).toFixed(0)}
                                -
                                {Math.max(
                                  ...trackingStats.map((s) => s.wavelength)
                                ).toFixed(0)}
                                nm
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Yield Analysis Tab Content */}
        {activeTab === "yield" && (
          <div className="flex-1 bg-white rounded-lg shadow-lg p-4 overflow-hidden flex flex-col min-h-0">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Monte Carlo Yield Simulation
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Predict manufacturing yield by simulating thousands of coating
              runs with realistic process variations.
            </p>

            <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden min-h-0">
              {/* Left: Configuration */}
              <div className="flex flex-col overflow-hidden min-h-0">
                <div className="bg-gray-50 p-3 rounded mb-3 flex-shrink-0">
                  <h3 className="text-sm font-semibold mb-3">
                    Simulation Parameters
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">
                        Number of Runs:
                      </label>
                      <input
                        type="number"
                        value={mcNumRuns}
                        onChange={(e) =>
                          setMcNumRuns(parseInt(e.target.value) || 1000)
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                        min="100"
                        max="10000"
                        step="100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        1,000 = fast (~10s), 5,000 = balanced (~40s), 10,000 =
                        accurate (~90s)
                      </p>
                    </div>

                    <div className="pt-3 border-t">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">
                        Manufacturing Error Tolerances:
                      </h4>

                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Thickness Error (±%):
                          </label>
                          <input
                            type="number"
                            value={mcThicknessError}
                            onChange={(e) =>
                              setMcThicknessError(
                                safesafeParseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                            min="0"
                            max="10"
                            step="0.1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Per-layer random variation (typical: 1-3%)
                          </p>
                        </div>

                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Refractive Index Error (±%):
                          </label>
                          <input
                            type="number"
                            value={mcRIError}
                            onChange={(e) =>
                              setMcRIError(
                                safesafeParseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                            min="0"
                            max="5"
                            step="0.1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            IAD/packing density variation (typical: 0.5-2%)
                          </p>
                        </div>

                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Tooling Factor Error (±%):
                          </label>
                          <input
                            type="number"
                            value={mcToolingError}
                            onChange={(e) =>
                              setMcToolingError(
                                safesafeParseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                            min="0"
                            max="5"
                            step="0.1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Calibration uncertainty (typical: 0.3-1%)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {targets.length === 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded mb-3 flex-shrink-0">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Please define target specifications in the Designer tab
                      before running simulation.
                    </p>
                  </div>
                )}

                <button
                  onClick={runMonteCarloSimulation}
                  disabled={mcRunning || targets.length === 0}
                  className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-shrink-0"
                >
                  {mcRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      <TrendingUp size={16} />
                      Run Monte Carlo Simulation
                    </>
                  )}
                </button>

                {mcRunning && (
                  <div className="mt-2 flex-shrink-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Progress</span>
                      <span className="text-xs font-semibold text-indigo-600">
                        {Math.round(mcProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${mcProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Results */}
              <div className="flex flex-col overflow-hidden min-h-0">
                {!mcResults ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <TrendingUp
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <p className="text-lg font-semibold mb-2">
                        No simulation results yet
                      </p>
                      <p className="text-sm">
                        Configure parameters and click "Run Monte Carlo
                        Simulation"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <h3 className="text-sm font-semibold mb-3">
                      Simulation Results
                    </h3>

                    {/* Yield Result */}
                    <div
                      className={`p-4 rounded-lg mb-4 border-2 ${
                        mcResults.passRate >= 95
                          ? "bg-green-50 border-green-300"
                          : mcResults.passRate >= 80
                          ? "bg-yellow-50 border-yellow-300"
                          : mcResults.passRate >= 60
                          ? "bg-orange-50 border-orange-300"
                          : "bg-red-50 border-red-300"
                      }`}
                    >
                      <div className="text-center">
                        <div
                          className="text-5xl font-bold mb-2"
                          style={{
                            color:
                              mcResults.passRate >= 95
                                ? "#16a34a"
                                : mcResults.passRate >= 80
                                ? "#ca8a04"
                                : mcResults.passRate >= 60
                                ? "#ea580c"
                                : "#dc2626",
                          }}
                        >
                          {mcResults.passRate.toFixed(1)}%
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                          Predicted Yield
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {mcResults.passedRuns} passed / {mcResults.totalRuns}{" "}
                          total runs
                        </div>
                      </div>
                    </div>

                    {/* Error Statistics */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="p-2 bg-green-50 border border-green-200 rounded">
                        <div className="text-xs text-gray-600">Best Case</div>
                        <div className="text-lg font-bold text-green-700">
                          {mcResults.bestCaseError.toFixed(2)}%
                        </div>
                      </div>
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                        <div className="text-xs text-gray-600">Average</div>
                        <div className="text-lg font-bold text-blue-700">
                          {mcResults.avgError.toFixed(2)}%
                        </div>
                      </div>
                      <div className="p-2 bg-red-50 border border-red-200 rounded">
                        <div className="text-xs text-gray-600">Worst Case</div>
                        <div className="text-lg font-bold text-red-700">
                          {mcResults.worstCaseError.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* Interpretation */}
                    <div className="p-3 bg-gray-50 border rounded mb-4">
                      <h4 className="text-xs font-semibold mb-2">
                        Interpretation:
                      </h4>
                      <p className="text-xs text-gray-700">
                        {mcResults.passRate >= 95 &&
                          "✅ Excellent - This design is very manufacturable with high confidence."}
                        {mcResults.passRate >= 80 &&
                          mcResults.passRate < 95 &&
                          "👍 Good - This design should be manufacturable with acceptable yield."}
                        {mcResults.passRate >= 60 &&
                          mcResults.passRate < 80 &&
                          "⚠️ Fair - Manufacturing may be challenging. Consider tightening process control or adjusting design."}
                        {mcResults.passRate < 60 &&
                          "❌ Poor - This design is not manufacturable with current process capabilities. Redesign recommended."}
                      </p>
                    </div>

                    {/* Error Distribution */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold mb-2">
                        Error Distribution:
                      </h4>
                      <div className="bg-white border rounded p-2">
                        <ResponsiveContainer width="100%" height={150}>
                          <BarChart data={mcResults.errorDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="range"
                              tick={{ fontSize: 8 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#4f46e5" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Example Stacks */}
                    {(mcResults.passedExamples.length > 0 ||
                      mcResults.failedExamples.length > 0) && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-semibold">
                            Example Coating Stacks:
                          </h4>
                          <button
                            onClick={() => setMcShowExamples(!mcShowExamples)}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            {mcShowExamples ? "Hide" : "Show"}
                          </button>
                        </div>

                        {mcShowExamples && (
                          <div className="space-y-3">
                            {mcResults.passedExamples.length > 0 && (
                              <div className="p-2 bg-green-50 border border-green-200 rounded">
                                <div className="text-xs font-semibold text-green-800 mb-1">
                                  Best Passing Examples (lowest error):
                                </div>
                                {mcResults.passedExamples.map(
                                  (example, idx) => (
                                    <div key={idx} className="text-xs mb-2">
                                      <div className="font-medium">
                                        Example {idx + 1} - Error:{" "}
                                        {example.error.toFixed(2)}%
                                      </div>
                                      <div className="pl-2 space-y-0.5">
                                        {example.layers.map((layer, lidx) => (
                                          <div
                                            key={lidx}
                                            className="flex justify-between"
                                            style={{
                                              backgroundColor:
                                                materialDispersion[
                                                  layer.material
                                                ].color,
                                              padding: "1px 2px",
                                              borderRadius: "2px",
                                            }}
                                          >
                                            <span>
                                              L{lidx + 1}: {layer.material}
                                            </span>
                                            <span>
                                              {layer.thickness.toFixed(1)}nm
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                            {mcResults.failedExamples.length > 0 && (
                              <div className="p-2 bg-red-50 border border-red-200 rounded">
                                <div className="text-xs font-semibold text-red-800 mb-1">
                                  Worst Failing Examples (highest error):
                                </div>
                                {mcResults.failedExamples.map(
                                  (example, idx) => (
                                    <div key={idx} className="text-xs mb-2">
                                      <div className="font-medium">
                                        Example {idx + 1} - Error:{" "}
                                        {example.error.toFixed(2)}%
                                      </div>
                                      <div className="pl-2 space-y-0.5">
                                        {example.layers.map((layer, lidx) => (
                                          <div
                                            key={lidx}
                                            className="flex justify-between"
                                            style={{
                                              backgroundColor:
                                                materialDispersion[
                                                  layer.material
                                                ].color,
                                              padding: "1px 2px",
                                              borderRadius: "2px",
                                            }}
                                          >
                                            <span>
                                              L{lidx + 1}: {layer.material}
                                            </span>
                                            <span>
                                              {layer.thickness.toFixed(1)}nm
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showToolingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-800">
                Tooling Factors
              </h2>
              <button
                onClick={() => setShowToolingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Layer Stack Selection */}
            <div className="mb-4 flex-shrink-0">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Machine:
              </label>
              <div className="px-3 py-2 border rounded bg-gray-50 font-medium">
                {machines.find((m) => m.id === currentMachineId)?.name ||
                  "Unknown Machine"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tooling factors apply to all layer stacks on this machine
              </p>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1">
              {Object.keys(materialDispersion).map((material) => {
                const currentMachine = machines.find(
                  (m) => m.id === currentMachineId
                );
                const toolingValue =
                  currentMachine?.toolingFactors?.[material] || 1.0;

                return (
                  <div
                    key={material}
                    className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                  >
                    <span className="text-sm font-medium">{material}</span>
                    <input
                      type="number"
                      value={toolingValue}
                      onChange={(e) =>
                        updateToolingFactor(
                          currentMachineId,
                          material,
                          e.target.value
                        )
                      }
                      className="w-20 px-2 py-1 border rounded text-sm"
                      step="0.01"
                    />
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowToolingModal(false)}
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 flex-shrink-0"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {showTargetsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Reflectivity Targets
              </h2>
              <button
                onClick={() => setShowTargetsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded border">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Recipe/Layer Stack:
              </label>
              <div className="flex gap-2">
                <select
                  value={currentRecipeId}
                  onChange={(e) => switchRecipe(parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 border rounded"
                >
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addRecipe}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1"
                >
                  <Plus size={14} /> New Recipe
                </button>
              </div>

              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={
                    recipes.find((r) => r.id === currentRecipeId)?.name || ""
                  }
                  onChange={(e) =>
                    renameRecipe(currentRecipeId, e.target.value)
                  }
                  className="flex-1 px-3 py-1 border rounded text-sm"
                  placeholder="Recipe name"
                />
                <button
                  onClick={() => deleteRecipe(currentRecipeId)}
                  disabled={recipes.length === 1}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Delete Recipe
                </button>
              </div>
            </div>

            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Targets for{" "}
                {recipes.find((r) => r.id === currentRecipeId)?.name}:
              </h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
              {targets.map((target) => (
                <div key={target.id} className="p-3 border rounded bg-gray-50">
                  <div className="grid grid-cols-6 gap-2 items-center">
                    <div>
                      <label className="text-xs text-gray-600">Name</label>
                      <input
                        type="text"
                        value={target.name}
                        onChange={(e) =>
                          updateTarget(target.id, "name", e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">
                        λ Min (nm)
                      </label>
                      <input
                        type="number"
                        value={target.wavelengthMin}
                        onChange={(e) =>
                          updateTarget(
                            target.id,
                            "wavelengthMin",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">
                        λ Max (nm)
                      </label>
                      <input
                        type="number"
                        value={target.wavelengthMax}
                        onChange={(e) =>
                          updateTarget(
                            target.id,
                            "wavelengthMax",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">R Min (%)</label>
                      <input
                        type="number"
                        value={target.reflectivityMin}
                        onChange={(e) =>
                          updateTarget(
                            target.id,
                            "reflectivityMin",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">R Max (%)</label>
                      <input
                        type="number"
                        value={target.reflectivityMax}
                        onChange={(e) =>
                          updateTarget(
                            target.id,
                            "reflectivityMax",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeTarget(target.id)}
                        className="w-full px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {targets.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4">
                  No targets defined for this recipe. Click "Add Target" to
                  create one.
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={addTarget}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 flex items-center justify-center gap-1"
              >
                <Plus size={16} /> Add Target
              </button>
              <button
                onClick={() => setShowTargetsModal(false)}
                className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IAD Modal */}
      {showIADModal && <IADModal />}

      {/* ========== COATING STRESS CALCULATOR MODAL ========== */}
      {showStressModal && stressResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Coating Stress Analysis
              </h2>
              <button
                onClick={() => setShowStressModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Stress</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stressResults.totalStress}{" "}
                    <span className="text-sm font-normal">MPa·nm</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {parseFloat(stressResults.totalStress) > 0
                      ? "Compressive"
                      : "Tensile"}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Risk Level</div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: stressResults.riskColor }}
                  >
                    {stressResults.riskLevel}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stressResults.totalStressMagnitude} MPa·nm
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">
                    Total Thickness
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stressResults.totalPhysicalThickness}{" "}
                    <span className="text-sm font-normal">nm</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Physical</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">
                    Optical Thickness
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stressResults.totalOpticalThickness}{" "}
                    <span className="text-sm font-normal">nm</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">QWOT basis</div>
                </div>
              </div>

              {/* Recommendation Box */}
              <div
                className="rounded-lg p-4 mb-6 border-2"
                style={{
                  backgroundColor:
                    stressResults.riskLevel === "LOW"
                      ? "#f0fdf4"
                      : stressResults.riskLevel === "MEDIUM"
                      ? "#fffbeb"
                      : "#fef2f2",
                  borderColor: stressResults.riskColor,
                }}
              >
                <div
                  className="font-semibold mb-2"
                  style={{ color: stressResults.riskColor }}
                >
                  Recommendation:
                </div>
                <div className="text-sm text-gray-700">
                  {stressResults.recommendation}
                </div>
              </div>

              {/* Layer-by-Layer Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Layer-by-Layer Analysis
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left border-b">#</th>
                        <th className="px-4 py-2 text-left border-b">
                          Material
                        </th>
                        <th className="px-4 py-2 text-right border-b">
                          Thickness (nm)
                        </th>
                        <th className="px-4 py-2 text-right border-b">
                          Intrinsic Stress (MPa)
                        </th>
                        <th className="px-4 py-2 text-center border-b">Type</th>
                        <th className="px-4 py-2 text-right border-b">
                          Stress Force (MPa·nm)
                        </th>
                        <th className="px-4 py-2 text-right border-b">
                          Cumulative (MPa·nm)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stressResults.layers.map((layer, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-4 py-2 border-b">
                            {layer.layerNum}
                          </td>
                          <td className="px-4 py-2 border-b font-medium">
                            {layer.material}
                          </td>
                          <td className="px-4 py-2 text-right border-b">
                            {layer.thickness}
                          </td>
                          <td className="px-4 py-2 text-right border-b">
                            {layer.intrinsicStress}
                          </td>
                          <td className="px-4 py-2 text-center border-b">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                layer.stressType === "Compressive"
                                  ? "bg-green-100 text-green-800"
                                  : layer.stressType === "Tensile"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {layer.stressType}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right border-b font-mono">
                            {layer.stressForce}
                          </td>
                          <td className="px-4 py-2 text-right border-b font-mono font-semibold">
                            {layer.cumulativeStress}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Stress Management Guidelines:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • <strong>Compressive stress</strong> (positive values):
                    Material wants to expand. Can cause buckling or
                    delamination.
                  </li>
                  <li>
                    • <strong>Tensile stress</strong> (negative values):
                    Material wants to contract. Can cause cracking.
                  </li>
                  <li>
                    • <strong>Balanced design:</strong> Alternate high-tensile
                    and high-compressive materials to minimize total stress.
                  </li>
                  <li>
                    • <strong>Annealing:</strong> Heat treatment at 150-200°C
                    for 2 hours can reduce stress by 30-50%.
                  </li>
                  <li>
                    • <strong>Critical threshold:</strong> Total stress
                    magnitude &gt;150,000 MPa·nm indicates high delamination
                    risk.
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowStressModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========== END STRESS MODAL ========== */}
    </div>
  );
};

export default ThinFilmDesigner;

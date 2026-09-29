import React, { useState } from 'react';
import { GradingState } from '../types/lut';
import {
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Sun,
  CloudSun,
  Sunset,
  Flame,
  Zap,
  Sparkles,
  TreePine,
  Cross,
  Maximize2,
  Minimize2,
  Sliders,
  SlidersHorizontal,
  Layers,
  Palette,
  Eye,
  Camera,
  Video,
  Check,
  Cloud,
  Moon,
  Compass,
  Heart,
} from 'lucide-react';

interface PrimarySlidersProps {
  state: GradingState;
  onChange: (patch: Partial<GradingState>) => void;
  onResetPrimaries: () => void;
}

interface BalanceMode {
  id: string;
  name: string;
  category: 'natural' | 'interior' | 'correction';
  kelvinLabel: string;
  temp: number;
  tint: number;
  description: string;
  icon: React.ReactNode;
}

interface CameraNaturalBalance {
  id: string;
  name: string;
  category?: 'daylight' | 'skin' | 'nature' | 'sunset' | 'interior';
  kelvinLabel: string;
  temp: number;
  tint: number;
  description: string;
  icon: React.ReactNode;
  patch?: Partial<GradingState>;
}

interface CameraBalanceGroup {
  id: string;
  brand?: 'panasonic' | 'sony' | 'canon' | 'blackmagic' | 'arri' | 'broadcast';
  brandLabel?: string;
  inputSpace: GradingState['inputSpace'];
  name: string;
  shortName: string;
  sensor: string;
  accentColor: string;
  correctionTip: string;
  balances: CameraNaturalBalance[];
}

export const PrimarySliders: React.FC<PrimarySlidersProps> = ({
  state,
  onChange,
  onResetPrimaries,
}) => {
  // Accordion state for all 4 rubrics
  const [openRubrics, setOpenRubrics] = useState<Record<string, boolean>>({
    rubric1: true,  // Balans Cromatic & Moduri Naturale
    rubric2: true,  // Expunere & Contrast
    rubric3: false, // Split Toning
    rubric4: false, // Spațiu Cromatic & Gamut
  });

  const toggleRubric = (key: string) => {
    setOpenRubrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExpandAll = () => {
    setOpenRubrics({ rubric1: true, rubric2: true, rubric3: true, rubric4: true });
  };

  const handleCollapseAll = () => {
    setOpenRubrics({ rubric1: false, rubric2: false, rubric3: false, rubric4: false });
  };

  const [balanceSubTab, setBalanceSubTab] = useState<'cameras' | 'environmental'>('cameras');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('panasonic_gh5');
  const [cameraCategoryFilter, setCameraCategoryFilter] = useState<'all' | 'daylight' | 'skin' | 'nature' | 'sunset' | 'interior'>('all');
  const [brandFilter, setBrandFilter] = useState<'all' | 'panasonic' | 'sony' | 'canon' | 'blackmagic' | 'arri' | 'broadcast'>('all');

  // Per-camera collapse/expand state (grouped by camera)
  const [expandedCameras, setExpandedCameras] = useState<Record<string, boolean>>({
    panasonic_gh5: true,
    panasonic_ux90: false,
    sony_fx30: false,
    canon_r6: false,
    bmdgen5: false,
    slog3: false,
    clog3: false,
    logc3: false,
    rec709: false,
  });

  const toggleCamera = (camId: string) => {
    setExpandedCameras((prev) => ({ ...prev, [camId]: !prev[camId] }));
  };

  const handleExpandAllCameras = () => {
    setExpandedCameras({
      panasonic_gh5: true,
      panasonic_ux90: true,
      sony_fx30: true,
      canon_r6: true,
      bmdgen5: true,
      slog3: true,
      clog3: true,
      logc3: true,
      rec709: true,
    });
  };

  const handleCollapseAllCameras = () => {
    setExpandedCameras({
      panasonic_gh5: false,
      panasonic_ux90: false,
      sony_fx30: false,
      canon_r6: false,
      bmdgen5: false,
      slog3: false,
      clog3: false,
      logc3: false,
      rec709: false,
    });
  };

  const getCameraBrand = (camId: string): { id: 'panasonic' | 'sony' | 'canon' | 'blackmagic' | 'arri' | 'broadcast'; label: string } => {
    if (camId.includes('panasonic')) return { id: 'panasonic', label: 'Panasonic' };
    if (camId.includes('sony') || camId === 'slog3') return { id: 'sony', label: 'Sony' };
    if (camId.includes('canon') || camId === 'clog3') return { id: 'canon', label: 'Canon' };
    if (camId.includes('bmpcc') || camId.includes('bmd')) return { id: 'blackmagic', label: 'Blackmagic' };
    if (camId.includes('logc') || camId.includes('arri')) return { id: 'arri', label: 'ARRI' };
    return { id: 'broadcast', label: 'Broadcast Rec.709' };
  };

  // Camera Groups with dedicated natural color balances for all video cameras (9 camera systems x 12 natural balances = 108 calibrations)
  const cameraGroups: CameraBalanceGroup[] = [
    {
      id: 'panasonic_gh5',
      inputSpace: 'panasonic_gh5',
      name: 'Panasonic Lumix GH5 / GH5S',
      shortName: 'Lumix GH5 / GH5S',
      sensor: 'M4/3 V-Log L · Compensare Tenta Verde Umbre',
      accentColor: '#38bdf8',
      correctionTip: 'Senzorul Panasonic GH5 împinge frecvent umbrele spre galben-verzui. Calibrările aplică compensare de +2 până la +6 Tint și ridică roșul în umbre pentru un ten roz-auriu catifelat.',
      balances: [
        {
          id: 'gh5-daylight',
          name: 'Soare Direct 5600K Neutru',
          category: 'daylight',
          kelvinLabel: '5600K Pure',
          temp: 1,
          tint: 3,
          description: 'Lumină de zi exterior: alb neutru pe rochie și cer curat fără nicio deviație verzuie.',
          icon: <Sun className="w-3.5 h-3.5 text-sky-400" />,
          patch: { inputSpace: 'panasonic_gh5', saturation: 1.06, colorBoost: 8, highlights: -10, whites: -4, shadows: 2 },
        },
        {
          id: 'gh5-skintone',
          name: 'Ton Natural Ten 10:30 (Anti-Green)',
          category: 'skin',
          kelvinLabel: 'Melanină 10:30',
          temp: 4,
          tint: 5,
          description: 'Aliniere optimă a hemoglobinei direct pe axa 10:30 a vectorscopului cu corecție de nuanță pe pomeți.',
          icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
          patch: { inputSpace: 'panasonic_gh5', saturation: 1.12, colorBoost: 12, highlights: -12, shadows: 4, lift: { r: 0.02, g: -0.03, b: 0.01 }, gain: { r: 1.06, g: 1.0, b: 0.95 } },
        },
        {
          id: 'gh5-shade',
          name: 'Umbră Deschisă & Cer Senin',
          category: 'daylight',
          kelvinLabel: '6800K - 7500K',
          temp: 14,
          tint: 4,
          description: 'Compensează cerul albastru rece sub copaci, menținând pielea caldă și rochia de mireasă imaculată.',
          icon: <CloudSun className="w-3.5 h-3.5 text-sky-300" />,
          patch: { inputSpace: 'panasonic_gh5', saturation: 1.08, colorBoost: 10, highlights: -12, shadows: 4 },
        },
        {
          id: 'gh5-overcast',
          name: 'Cer Noros & Lumină Moale Difuză',
          category: 'daylight',
          kelvinLabel: '6000K Soft',
          temp: 8,
          tint: 3,
          description: 'Lumină difuză de nori: contrast blând, lumini catifelate fără reflexii aspre pe frunte.',
          icon: <Cloud className="w-3.5 h-3.5 text-slate-300" />,
          patch: { inputSpace: 'panasonic_gh5', saturation: 1.06, colorBoost: 10, highlights: -8, whites: -2, shadows: 2 },
        },
        {
          id: 'gh5-foliage',
          name: 'Cununie în Natură & Verdeață',
          category: 'nature',
          kelvinLabel: 'Grădină / Parc',
          temp: 5,
          tint: -2,
          description: 'Calmează saturația excesivă a ierbii de vară și îndepărtează reflexia verzuie de pe miri.',
          icon: <TreePine className="w-3.5 h-3.5 text-emerald-400" />,
          patch: { inputSpace: 'panasonic_gh5', saturation: 1.08, colorBoost: 10, highlights: -14, shadows: 4, hueVsSat: { red: 10, yellow: -8, green: -22, cyan: 4, blue: 6, magenta: -4 } },
        },
        {
          id: 'gh5-forest',
          name: 'Pădure Densă & Smarald Organic',
          category: 'nature',
          kelvinLabel: 'Pădure Conifere',
          temp: 4,
          tint: -4,
          description: 'Transformă verdele dur în verde smarald organic de peliculă cinematografică.',
          icon: <TreePine className="w-3.5 h-3.5 text-teal-400" />,
          patch: { inputSpace: 'panasonic_gh5', saturation: 1.10, colorBoost: 8, highlights: -16, shadows: 4, hueVsSat: { red: 8, yellow: -10, green: -24, cyan: 6, blue: 4, magenta: -4 } },
        },
        {
          id: 'gh5-sunrise',
          name: 'Răsărit de Soare / Matinal Diafan',
          category: 'sunset',
          kelvinLabel: '4500K Aurora',
          temp: -3,
          tint: 3,
          description: 'Lumină curată diafană de dimineață devreme, cu strălucire discretă și contrast curat.',
          icon: <Sun className="w-3.5 h-3.5 text-amber-300" />,
          patch: { inputSpace: 'panasonic_gh5', saturation: 1.05, colorBoost: 8, highlights: -10, shadows: 2 },
        },
        {
          id: 'gh5-sunset',
          name: 'Apus / Golden Hour Cald',
          category: 'sunset',
          kelvinLabel: '3200K - 4000K',
          temp: 20,
          tint: 4,
          description: 'Radiație caldă organică de chihlimbar și miere pe voalul miresei.',
          icon: <Sunset className="w-3.5 h-3.5 text-amber-500" />,
          patch: { inputSpace: 'panasonic_gh5', saturation: 1.14, colorBoost: 12, highlights: -16, shadows: -2 },
        },
        {
          id: 'gh5-bluehour',
          name: 'Ora Albastră & Amurg Romantic',
          category: 'sunset',
          kelvinLabel: 'Blue Hour Twilight',
          temp: 12,
          tint: -2,
          description: 'Amurg după apus: păstrează cerul albastru profund cinematografic în timp ce tenul rămâne cald.',
          icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
          patch: { inputSpace: 'panasonic_gh5', saturation: 1.10, colorBoost: 10, highlights: -14, shadows: 0 },
        },
        {
          id: 'gh5-window',
          name: 'Lumină Fereastră / Pregătire Miri',
          category: 'skin',
          kelvinLabel: 'Portret Fereastră',
          temp: 2,
          tint: 4,
          description: 'Cadre la machiaj și pregătirea miresei: tranziție fină de la lumină la umbră pe pomeți.',
          icon: <Heart className="w-3.5 h-3.5 text-rose-300" />,
          patch: { inputSpace: 'panasonic_gh5', saturation: 1.08, colorBoost: 10, highlights: -12, whites: -4, shadows: 4 },
        },
        {
          id: 'gh5-church',
          name: 'Biserică & Lumânări / Vitralii',
          category: 'interior',
          kelvinLabel: 'Sacred Ambient',
          temp: -8,
          tint: 6,
          description: 'Echilibrează lumina caldă a lumânărilor cu vitraliile reci, protejând albul veșmintelor.',
          icon: <Cross className="w-3.5 h-3.5 text-purple-400" />,
          patch: { inputSpace: 'panasonic_gh5', saturation: 1.05, colorBoost: 8, highlights: -18, shadows: 6 },
        },
        {
          id: 'gh5-hall-led',
          name: 'Sală Nuntă & Lumini LED',
          category: 'interior',
          kelvinLabel: 'Lumină Mixtă',
          temp: -6,
          tint: -2,
          description: 'Compensează reflectoarele LED și tuburile fluorescente pentru un ten uniform pe ringul de dans.',
          icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
          patch: { inputSpace: 'panasonic_gh5', saturation: 1.04, colorBoost: 6, highlights: -16, whites: -6, shadows: 4 },
        },
      ],
    },
    {
      id: 'panasonic_ux90',
      inputSpace: 'panasonic_ux90',
      name: 'Panasonic AG-UX90 4K Camcorder',
      shortName: 'Panasonic AG-UX90',
      sensor: '1-inch MOS · Îmblânzire Saturație Broadcast',
      accentColor: '#818cf8',
      correctionTip: 'Camcorderul UX90 tinde să redea galbenul și roșul cu asprime broadcast. Calibrările coboară saturația digitală dură și aduc un ten catifelat.',
      balances: [
        {
          id: 'ux90-daylight',
          name: 'Soare Direct 5600K Neutru',
          category: 'daylight',
          kelvinLabel: '5600K Pure',
          temp: 0,
          tint: 1,
          description: 'Lumină solară directă fără tentă galbenă sau saturație broadcast agresivă.',
          icon: <Sun className="w-3.5 h-3.5 text-indigo-400" />,
          patch: { inputSpace: 'panasonic_ux90', saturation: 0.96, colorBoost: 4, highlights: -14, shadows: 4 },
        },
        {
          id: 'ux90-skintone',
          name: 'Ton Piele Catifelat (Soft Skintone)',
          category: 'skin',
          kelvinLabel: 'Soft Broadcast',
          temp: 2,
          tint: 2,
          description: 'Îndulcește tenul mirilor, protejând detaliul din dantela albă și reducând roșeața feței.',
          icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
          patch: { inputSpace: 'panasonic_ux90', saturation: 0.96, colorBoost: 6, highlights: -16, whites: -6, shadows: 6, gain: { r: 1.02, g: 0.99, b: 0.96 }, hueVsSat: { red: -8, yellow: -10, green: -18, cyan: -5, blue: 0, magenta: -12 } },
        },
        {
          id: 'ux90-shade',
          name: 'Umbră Deschisă 6800K',
          category: 'daylight',
          kelvinLabel: '6800K Umbră',
          temp: 12,
          tint: 3,
          description: 'Compensează tenta albastră a umbrelor fără a supra-satura pielea.',
          icon: <CloudSun className="w-3.5 h-3.5 text-indigo-300" />,
          patch: { inputSpace: 'panasonic_ux90', saturation: 0.95, colorBoost: 5, highlights: -14, shadows: 6 },
        },
        {
          id: 'ux90-overcast',
          name: 'Cer Noros & Lumină Difuză',
          category: 'daylight',
          kelvinLabel: '6000K Noros',
          temp: 6,
          tint: 2,
          description: 'Claritate blândă sub cer acoperit de nori, protejând detaliile din albul rochiei.',
          icon: <Cloud className="w-3.5 h-3.5 text-slate-300" />,
          patch: { inputSpace: 'panasonic_ux90', saturation: 0.96, colorBoost: 6, highlights: -12, whites: -4, shadows: 4 },
        },
        {
          id: 'ux90-garden',
          name: 'Cununie în Grădină & Frunziș',
          category: 'nature',
          kelvinLabel: 'Exterior Grădină',
          temp: 3,
          tint: -2,
          description: 'Calmează vegetația saturată artificial și menține smokingul la un negru curat.',
          icon: <TreePine className="w-3.5 h-3.5 text-emerald-400" />,
          patch: { inputSpace: 'panasonic_ux90', saturation: 0.95, colorBoost: 6, highlights: -16, shadows: 6 },
        },
        {
          id: 'ux90-forest',
          name: 'Pădure & Verdeață Calmată',
          category: 'nature',
          kelvinLabel: 'Pădure / Parc',
          temp: 2,
          tint: -4,
          description: 'Transformă verdele broadcast într-o nuanță mai odihnitoare, fără reflexii pe obraji.',
          icon: <TreePine className="w-3.5 h-3.5 text-teal-400" />,
          patch: { inputSpace: 'panasonic_ux90', saturation: 0.94, colorBoost: 5, highlights: -18, shadows: 6 },
        },
        {
          id: 'ux90-sunrise',
          name: 'Răsărit de Soare Diafan',
          category: 'sunset',
          kelvinLabel: 'Aurora 4600K',
          temp: -4,
          tint: 2,
          description: 'Tonalitate curată la primele ore ale dimineții, prevenind arderea canalului de roșu.',
          icon: <Sun className="w-3.5 h-3.5 text-indigo-300" />,
          patch: { inputSpace: 'panasonic_ux90', saturation: 0.96, colorBoost: 5, highlights: -12, whites: -4, shadows: 4 },
        },
        {
          id: 'ux90-sunset',
          name: 'Apus Cald de Seară',
          category: 'sunset',
          kelvinLabel: 'Golden Ambient',
          temp: 18,
          tint: 2,
          description: 'Căldură romantică de apus cu contrast atenuat pentru a evita arsurile specifice camcorderului.',
          icon: <Sunset className="w-3.5 h-3.5 text-amber-500" />,
          patch: { inputSpace: 'panasonic_ux90', saturation: 0.98, colorBoost: 8, highlights: -18, whites: -6, shadows: 4 },
        },
        {
          id: 'ux90-bluehour',
          name: 'Ora Albastră / Amurg',
          category: 'sunset',
          kelvinLabel: 'Amurg Calmat',
          temp: 10,
          tint: 0,
          description: 'Echilibrează amurgul fără zgomot de crominanță în zonele întunecate.',
          icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
          patch: { inputSpace: 'panasonic_ux90', saturation: 0.95, colorBoost: 6, highlights: -14, shadows: 2 },
        },
        {
          id: 'ux90-window',
          name: 'Lumină Fereastră / Portret Natural',
          category: 'skin',
          kelvinLabel: 'Interior Natural',
          temp: 1,
          tint: 3,
          description: 'Textură plăcută a pielii sub lumina naturală a ferestrei din camera miresei.',
          icon: <Heart className="w-3.5 h-3.5 text-rose-300" />,
          patch: { inputSpace: 'panasonic_ux90', saturation: 0.96, colorBoost: 6, highlights: -14, whites: -4, shadows: 6 },
        },
        {
          id: 'ux90-church',
          name: 'Biserică & Cununie Religioasă',
          category: 'interior',
          kelvinLabel: 'Slujbă Religioasă',
          temp: -10,
          tint: 4,
          description: 'Atenuează reflexiile pe icoane și aur menținând atmosfera caldă solemnă.',
          icon: <Cross className="w-3.5 h-3.5 text-purple-400" />,
          patch: { inputSpace: 'panasonic_ux90', saturation: 0.94, colorBoost: 6, highlights: -18, shadows: 6 },
        },
        {
          id: 'ux90-hall-led',
          name: 'Sală Nuntă & Ring LED',
          category: 'interior',
          kelvinLabel: 'Party Guard',
          temp: -8,
          tint: -4,
          description: 'Protejează fețele de exploziile lămpilor LED mobile de la masa mirilor și ringul de dans.',
          icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
          patch: { inputSpace: 'panasonic_ux90', saturation: 0.92, colorBoost: 6, highlights: -20, whites: -8, shadows: 8 },
        },
      ],
    },
    {
      id: 'sony_fx30',
      inputSpace: 'sony_fx30',
      name: 'Sony FX30 / FX3 (S-Log3 / S-Cinetone)',
      shortName: 'Sony FX30 / FX3',
      sensor: 'Super35 / Full-Frame · Neutralizare Măsliniu Ten',
      accentColor: '#ec4899',
      correctionTip: 'S-Log3 pe senzorul Sony are o deviație măslinie-gălbuie în tonurile medii. Calibrările curăță nuanța de piele și transformă verdele galben-neon în smarald organic.',
      balances: [
        {
          id: 'fx30-daylight',
          name: 'Soare Direct 5600K Neutru',
          category: 'daylight',
          kelvinLabel: '5600K Pure',
          temp: 0,
          tint: 1,
          description: 'Lumină solară pură fără deviație verde, cer albastru bogat și rochie albă impecabilă.',
          icon: <Sun className="w-3.5 h-3.5 text-pink-400" />,
          patch: { inputSpace: 'sony_fx30', saturation: 1.06, colorBoost: 8, highlights: -12, shadows: 0, gain: { r: 1.02, g: 1.0, b: 0.97 } },
        },
        {
          id: 'fx30-skintone',
          name: 'Ton Natural Ten (Anti-Olive)',
          category: 'skin',
          kelvinLabel: 'Roz-Auriu Sănătos',
          temp: 3,
          tint: 2,
          description: 'Elimină tenta gălbuie-măslinie din pomeți și aduce pielea exact pe axa melaninei de 10:30.',
          icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
          patch: { inputSpace: 'sony_fx30', saturation: 1.1, colorBoost: 12, highlights: -14, shadows: -2, lift: { r: 0.01, g: -0.01, b: 0.0 }, gain: { r: 1.05, g: 1.01, b: 0.96 }, hueVsHue: { red: 4, yellow: -6, green: 12, cyan: -4, blue: -2, magenta: 0 }, hueVsSat: { red: 16, yellow: 10, green: -15, cyan: 5, blue: 8, magenta: -6 } },
        },
        {
          id: 'fx30-shade',
          name: 'Umbră Deschisă Cer Senin 7000K',
          category: 'daylight',
          kelvinLabel: '7000K Cer Senin',
          temp: 15,
          tint: 3,
          description: 'Neutralizează reflexia albastră a cerului în umbră, păstrând nuanța tenului caldă și vie.',
          icon: <CloudSun className="w-3.5 h-3.5 text-pink-300" />,
          patch: { inputSpace: 'sony_fx30', saturation: 1.08, colorBoost: 10, highlights: -14, shadows: 0 },
        },
        {
          id: 'fx30-overcast',
          name: 'Cer Noros & Lumină Moale',
          category: 'daylight',
          kelvinLabel: '6200K Soft Light',
          temp: 8,
          tint: 2,
          description: 'Redare echilibrată a luminii difuze de zi cu separare plăcută a subiectului.',
          icon: <Cloud className="w-3.5 h-3.5 text-slate-300" />,
          patch: { inputSpace: 'sony_fx30', saturation: 1.06, colorBoost: 8, highlights: -10, whites: -3, shadows: 0 },
        },
        {
          id: 'fx30-forest',
          name: 'Cununie Natură & Verde Smarald',
          category: 'nature',
          kelvinLabel: 'Smarald Organic',
          temp: 4,
          tint: -3,
          description: 'Transformă verdele neon Sony într-un verde smarald organic de peliculă cinematografică.',
          icon: <TreePine className="w-3.5 h-3.5 text-emerald-400" />,
          patch: { inputSpace: 'sony_fx30', saturation: 1.08, colorBoost: 10, highlights: -16, shadows: 2, hueVsHue: { red: 2, yellow: -8, green: 16, cyan: -2, blue: 0, magenta: 0 }, hueVsSat: { red: 12, yellow: -10, green: -20, cyan: 6, blue: 8, magenta: -4 } },
        },
        {
          id: 'fx30-deepforest',
          name: 'Pădure & Umbre Răcoroase',
          category: 'nature',
          kelvinLabel: 'Pădure Umbroasă',
          temp: 2,
          tint: -5,
          description: 'Elimină reflexia verde din umbrele feței când mirii sunt fotografiați sub ramuri dese.',
          icon: <TreePine className="w-3.5 h-3.5 text-teal-400" />,
          patch: { inputSpace: 'sony_fx30', saturation: 1.08, colorBoost: 8, highlights: -18, shadows: 2, hueVsSat: { red: 10, yellow: -12, green: -24, cyan: 4, blue: 6, magenta: -4 } },
        },
        {
          id: 'fx30-sunrise',
          name: 'Răsărit / Lumină Matinală Caldă',
          category: 'sunset',
          kelvinLabel: 'Morning Glow',
          temp: -3,
          tint: 2,
          description: 'Lumină proaspătă și clară de dimineață, ideală pentru cadrele introductive.',
          icon: <Sun className="w-3.5 h-3.5 text-pink-300" />,
          patch: { inputSpace: 'sony_fx30', saturation: 1.06, colorBoost: 8, highlights: -12, shadows: 0 },
        },
        {
          id: 'fx30-sunset',
          name: 'Apus Cald Tuscan Sunset',
          category: 'sunset',
          kelvinLabel: 'Tuscan Honey',
          temp: 20,
          tint: 2,
          description: 'Ședință foto la apus: strălucire auriu-miere pe părul miresei și nuanțe calde mătăsoase.',
          icon: <Sunset className="w-3.5 h-3.5 text-amber-500" />,
          patch: { inputSpace: 'sony_fx30', saturation: 1.14, colorBoost: 14, highlights: -20, shadows: -4, gain: { r: 1.08, g: 1.03, b: 0.94 } },
        },
        {
          id: 'fx30-bluehour',
          name: 'Ora Albastră & Amurg Cinematic',
          category: 'sunset',
          kelvinLabel: 'Blue Hour Dusk',
          temp: 12,
          tint: -1,
          description: 'Cer de un albastru profund elegant și iluminare caldă de felinar pe miri.',
          icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
          patch: { inputSpace: 'sony_fx30', saturation: 1.12, colorBoost: 12, highlights: -16, shadows: -2 },
        },
        {
          id: 'fx30-window',
          name: 'Lumină Fereastră Pregătire Miri',
          category: 'skin',
          kelvinLabel: 'Portret Fereastră',
          temp: 2,
          tint: 3,
          description: 'Tranziție catifelată pe ten în interiorul camerei de hotel sau acasă.',
          icon: <Heart className="w-3.5 h-3.5 text-rose-300" />,
          patch: { inputSpace: 'sony_fx30', saturation: 1.08, colorBoost: 10, highlights: -14, whites: -4, shadows: 2 },
        },
        {
          id: 'fx30-church',
          name: 'Biserică & Candelabre Solemn',
          category: 'interior',
          kelvinLabel: 'Solemn 3200K',
          temp: -10,
          tint: 4,
          description: 'Menține albul veșmintelor preoțești și lumânările calde fără clipping în zonele de strălucire.',
          icon: <Cross className="w-3.5 h-3.5 text-purple-400" />,
          patch: { inputSpace: 'sony_fx30', saturation: 1.06, colorBoost: 8, highlights: -18, shadows: 4 },
        },
        {
          id: 'fx30-hall-led',
          name: 'Sală Recepție & DJ Party',
          category: 'interior',
          kelvinLabel: 'Party Lights Guard',
          temp: -10,
          tint: -10,
          description: 'Neutralizează luminile fluorescente și laserele DJ saturate de pe ringul de dans.',
          icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
          patch: { inputSpace: 'sony_fx30', saturation: 1.04, colorBoost: 6, highlights: -16, shadows: 2 },
        },
      ],
    },
    {
      id: 'canon_r6',
      inputSpace: 'canon_r6',
      name: 'Canon EOS R6 / R6 Mark II (C-Log3)',
      shortName: 'Canon EOS R6',
      sensor: 'Full-Frame Dual Pixel · Stabilizare Canal Roșu',
      accentColor: '#ef4444',
      correctionTip: 'Senzorul Canon excelează pe ten, dar poate congestiona roșul sub lumini artificiale puternice. Calibrările stabilizează roșul și previn supra-saturarea obrajilor.',
      balances: [
        {
          id: 'r6-daylight',
          name: 'Soare Direct 5600K Clasic',
          category: 'daylight',
          kelvinLabel: '5600K Clasic',
          temp: 0,
          tint: -1,
          description: 'Echilibru neutru de exterior pentru C-Log3: cer adânc și detalii cristaline în dantela rochiei.',
          icon: <Sun className="w-3.5 h-3.5 text-red-400" />,
          patch: { inputSpace: 'canon_r6', saturation: 1.06, colorBoost: 6, highlights: -12, shadows: 0, gain: { r: 1.01, g: 1.0, b: 0.98 } },
        },
        {
          id: 'r6-skintone',
          name: 'Canon Skintone Magic (Ten Natural)',
          category: 'skin',
          kelvinLabel: 'Fidelitate Canon',
          temp: 2,
          tint: -1,
          description: 'Celebra știință de culoare Canon pe ten: obrajii mirilor luminoși, naturali și catifelați.',
          icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
          patch: { inputSpace: 'canon_r6', saturation: 1.08, colorBoost: 8, highlights: -15, whites: -4, shadows: 2, gain: { r: 1.03, g: 1.01, b: 0.97 }, hueVsHue: { red: 2, yellow: -4, green: 8, cyan: 0, blue: -2, magenta: -2 }, hueVsSat: { red: 8, yellow: 12, green: -20, cyan: -5, blue: 5, magenta: -10 } },
        },
        {
          id: 'r6-shade',
          name: 'Umbră Deschisă & Cer Senin',
          category: 'daylight',
          kelvinLabel: '6800K Umbră',
          temp: 14,
          tint: 0,
          description: 'Compensează cerul rece de vară fără a vira tonul pielii în magenta.',
          icon: <CloudSun className="w-3.5 h-3.5 text-red-300" />,
          patch: { inputSpace: 'canon_r6', saturation: 1.06, colorBoost: 8, highlights: -12, shadows: 2 },
        },
        {
          id: 'r6-overcast',
          name: 'Cer Înnorat & Tonuri Neutre',
          category: 'daylight',
          kelvinLabel: '6200K Înnorat',
          temp: 7,
          tint: -1,
          description: 'Păstrează contrastul luminos și textura delicată a fețelor în zile înnorate.',
          icon: <Cloud className="w-3.5 h-3.5 text-slate-300" />,
          patch: { inputSpace: 'canon_r6', saturation: 1.05, colorBoost: 7, highlights: -10, whites: -3, shadows: 1 },
        },
        {
          id: 'r6-garden',
          name: 'Grădină & Frunziș Calmat',
          category: 'nature',
          kelvinLabel: 'Parc & Natură',
          temp: 3,
          tint: -4,
          description: 'Temperează tenta caldă/galbenă din frunze și păstrează tenul mirilor radiant fără reflexii.',
          icon: <TreePine className="w-3.5 h-3.5 text-emerald-400" />,
          patch: { inputSpace: 'canon_r6', saturation: 1.06, colorBoost: 8, highlights: -16, shadows: 2, hueVsSat: { red: 6, yellow: -6, green: -24, cyan: 4, blue: 4, magenta: -6 } },
        },
        {
          id: 'r6-forest',
          name: 'Pădure & Smarald Botanic',
          category: 'nature',
          kelvinLabel: 'Verde Nobil',
          temp: 2,
          tint: -5,
          description: 'Armonie botanică plăcută între vegetație și rochia de mireasă albă perlat.',
          icon: <TreePine className="w-3.5 h-3.5 text-teal-400" />,
          patch: { inputSpace: 'canon_r6', saturation: 1.07, colorBoost: 8, highlights: -18, shadows: 4, hueVsSat: { red: 6, yellow: -8, green: -26, cyan: 4, blue: 6, magenta: -6 } },
        },
        {
          id: 'r6-sunrise',
          name: 'Răsărit de Soare & Căldură Matinală',
          category: 'sunset',
          kelvinLabel: 'Răsărit Clar',
          temp: -4,
          tint: 0,
          description: 'Lumină matinală proaspătă și contrast pur la primele ore ale evenimentului.',
          icon: <Sun className="w-3.5 h-3.5 text-red-300" />,
          patch: { inputSpace: 'canon_r6', saturation: 1.06, colorBoost: 6, highlights: -12, shadows: 0 },
        },
        {
          id: 'r6-sunset',
          name: 'Apus Auriu & Voal Mătăsos',
          category: 'sunset',
          kelvinLabel: 'Golden Hour',
          temp: 18,
          tint: 0,
          description: 'Scaldă rochia și fețele într-o lumină caldă de poveste, cu separare optimă a fundalului.',
          icon: <Sunset className="w-3.5 h-3.5 text-amber-500" />,
          patch: { inputSpace: 'canon_r6', saturation: 1.12, colorBoost: 12, highlights: -18, shadows: -2, gain: { r: 1.06, g: 1.02, b: 0.95 } },
        },
        {
          id: 'r6-bluehour',
          name: 'Ora Albastră & Seară Romantică',
          category: 'sunset',
          kelvinLabel: 'Amurg Romantic',
          temp: 12,
          tint: -2,
          description: 'Contrast cinematografic între cerul violet-albăstrui și iluminarea festivă.',
          icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
          patch: { inputSpace: 'canon_r6', saturation: 1.08, colorBoost: 10, highlights: -14, shadows: 0 },
        },
        {
          id: 'r6-window',
          name: 'Lumină Fereastră & Machiaj Mireasă',
          category: 'skin',
          kelvinLabel: 'Machiaj Mătăsos',
          temp: 1,
          tint: 0,
          description: 'Subliniază naturalețea machiajului fără reflexii grase pe nas sau frunte.',
          icon: <Heart className="w-3.5 h-3.5 text-rose-300" />,
          patch: { inputSpace: 'canon_r6', saturation: 1.06, colorBoost: 8, highlights: -14, whites: -4, shadows: 2 },
        },
        {
          id: 'r6-church',
          name: 'Biserică & Candelabre Aurii',
          category: 'interior',
          kelvinLabel: 'Ambient Biserică',
          temp: -8,
          tint: 1,
          description: 'Neutralizează excesul de roșu sub lămpile calde, păstrând solemnitatea ceremonială.',
          icon: <Cross className="w-3.5 h-3.5 text-purple-400" />,
          patch: { inputSpace: 'canon_r6', saturation: 1.04, colorBoost: 6, highlights: -16, shadows: 4 },
        },
        {
          id: 'r6-hall-led',
          name: 'Sală Nuntă & Lumini Mixte',
          category: 'interior',
          kelvinLabel: 'LED & Bec Cald',
          temp: -8,
          tint: -4,
          description: 'Echilibru uniform între luminile ambientale calde și reflectoarele reci ale formației.',
          icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
          patch: { inputSpace: 'canon_r6', saturation: 1.05, colorBoost: 6, highlights: -16, shadows: 2 },
        },
      ],
    },
    {
      id: 'bmdgen5',
      inputSpace: 'bmdgen5',
      name: 'Blackmagic Pocket BMPCC 4K/6K',
      shortName: 'Blackmagic BMPCC',
      sensor: 'Dual Native ISO · Film Look Organic Gen 5',
      accentColor: '#f97316',
      correctionTip: 'Color Science Gen 5 de la Blackmagic oferă roll-off filmic excepțional. Calibrările mențin transparența naturală a tenului fără asprime digitală.',
      balances: [
        {
          id: 'bmpcc-daylight',
          name: 'Soare Direct 5600K Film Neutru',
          category: 'daylight',
          kelvinLabel: '5600K Film',
          temp: 0,
          tint: 0,
          description: 'Balans de zi exterior pentru Blackmagic RAW / Gen 5: roll-off catifelat pe rochie fără cliping.',
          icon: <Sun className="w-3.5 h-3.5 text-orange-400" />,
          patch: { inputSpace: 'bmdgen5', saturation: 1.08, colorBoost: 6, highlights: -14, shadows: 0 },
        },
        {
          id: 'bmpcc-skintone',
          name: 'Ton Piele Film Kodak 10:30',
          category: 'skin',
          kelvinLabel: 'Kodak Vision3',
          temp: 2,
          tint: 1,
          description: 'Ten organic tip peliculă Kodak Vision3, cu tranziții line în zonele de umbră.',
          icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
          patch: { inputSpace: 'bmdgen5', saturation: 1.10, colorBoost: 10, highlights: -16, shadows: 2, gain: { r: 1.04, g: 1.01, b: 0.96 } },
        },
        {
          id: 'bmpcc-shade',
          name: 'Umbră Deschisă 6800K Film Look',
          category: 'daylight',
          kelvinLabel: '6800K Umbră',
          temp: 14,
          tint: 2,
          description: 'Compensează cerul deschis de vară cu căldură filmică discretă în umbre.',
          icon: <CloudSun className="w-3.5 h-3.5 text-orange-300" />,
          patch: { inputSpace: 'bmdgen5', saturation: 1.08, colorBoost: 8, highlights: -14, shadows: 2 },
        },
        {
          id: 'bmpcc-overcast',
          name: 'Cer Noros & Lumină Catifelată',
          category: 'daylight',
          kelvinLabel: '6000K Noros',
          temp: 8,
          tint: 1,
          description: 'Tranziții fine și textură cinematografică bogată sub cer acoperit.',
          icon: <Cloud className="w-3.5 h-3.5 text-slate-300" />,
          patch: { inputSpace: 'bmdgen5', saturation: 1.06, colorBoost: 6, highlights: -12, whites: -2, shadows: 2 },
        },
        {
          id: 'bmpcc-forest',
          name: 'Cununie Pădure & Natură Smarald',
          category: 'nature',
          kelvinLabel: 'Pădure Smarald',
          temp: 4,
          tint: -4,
          description: 'Nuanțe bogate de verde smarald și pământ ars, ten protejat și contrast bogat.',
          icon: <TreePine className="w-3.5 h-3.5 text-emerald-400" />,
          patch: { inputSpace: 'bmdgen5', saturation: 1.10, colorBoost: 8, highlights: -16, shadows: 4, hueVsSat: { red: 8, yellow: -8, green: -20, cyan: 2, blue: 4, magenta: -4 } },
        },
        {
          id: 'bmpcc-deepforest',
          name: 'Pădure Adâncă & Mușchi Organic',
          category: 'nature',
          kelvinLabel: 'Verde Peliculă',
          temp: 2,
          tint: -6,
          description: 'Tonuri profunde de pădure carpatină cu contrast nobil pe hainele mirilor.',
          icon: <TreePine className="w-3.5 h-3.5 text-teal-400" />,
          patch: { inputSpace: 'bmdgen5', saturation: 1.10, colorBoost: 8, highlights: -18, shadows: 4, hueVsSat: { red: 8, yellow: -10, green: -24, cyan: 2, blue: 4, magenta: -4 } },
        },
        {
          id: 'bmpcc-sunrise',
          name: 'Răsărit Diafan Matinal',
          category: 'sunset',
          kelvinLabel: '4600K Matinal',
          temp: -3,
          tint: 1,
          description: 'Separare spectaculoasă în lumina discretă de la începutul zilei.',
          icon: <Sun className="w-3.5 h-3.5 text-orange-300" />,
          patch: { inputSpace: 'bmdgen5', saturation: 1.06, colorBoost: 6, highlights: -12, shadows: 0 },
        },
        {
          id: 'bmpcc-sunset',
          name: 'Apus Auriu Cinematografic',
          category: 'sunset',
          kelvinLabel: 'Cinematic Amber',
          temp: 22,
          tint: 2,
          description: 'Auriu cinematografic profund la apus, cu flare-uri calde și textură fină.',
          icon: <Sunset className="w-3.5 h-3.5 text-amber-500" />,
          patch: { inputSpace: 'bmdgen5', saturation: 1.14, colorBoost: 12, highlights: -20, shadows: -2 },
        },
        {
          id: 'bmpcc-bluehour',
          name: 'Ora Albastră Film Noir',
          category: 'sunset',
          kelvinLabel: 'Dusk Film Noir',
          temp: 12,
          tint: 0,
          description: 'Atmosferă cinematografică nocturnă cu umbre catifelate și reflexii calde.',
          icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
          patch: { inputSpace: 'bmdgen5', saturation: 1.10, colorBoost: 10, highlights: -16, shadows: 0 },
        },
        {
          id: 'bmpcc-window',
          name: 'Lumină Fereastră Cadru Natural',
          category: 'skin',
          kelvinLabel: 'Portret Organic',
          temp: 2,
          tint: 1,
          description: 'Iluminare de pictură renascentistă la fereastră pentru rochia de mireasă.',
          icon: <Heart className="w-3.5 h-3.5 text-rose-300" />,
          patch: { inputSpace: 'bmdgen5', saturation: 1.08, colorBoost: 8, highlights: -14, whites: -4, shadows: 2 },
        },
        {
          id: 'bmpcc-church',
          name: 'Biserică & Vitralii Sacre',
          category: 'interior',
          kelvinLabel: 'High Dynamic',
          temp: -10,
          tint: 5,
          description: 'Gamă dinamică maximă în biserică: detaliu în umbre fără a arde lumânările.',
          icon: <Cross className="w-3.5 h-3.5 text-purple-400" />,
          patch: { inputSpace: 'bmdgen5', saturation: 1.06, colorBoost: 8, highlights: -18, shadows: 4 },
        },
        {
          id: 'bmpcc-hall-led',
          name: 'Sală Dans & DJ Lights',
          category: 'interior',
          kelvinLabel: 'Saturație Controlată',
          temp: -8,
          tint: -6,
          description: 'Păstrează claritatea tenului chiar și sub fasciculele puternice ale laserelor DJ.',
          icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
          patch: { inputSpace: 'bmdgen5', saturation: 1.06, colorBoost: 6, highlights: -16, shadows: 2 },
        },
      ],
    },
    {
      id: 'slog3',
      inputSpace: 'slog3',
      name: 'Sony Alpha A7S III / A7 IV / FX6',
      shortName: 'Sony A7S III / FX6',
      sensor: 'Full-Frame S-Gamut3.Cine · Transmisie Rec.709 Curată',
      accentColor: '#3b82f6',
      correctionTip: 'S-Gamut3.Cine pe Full-Frame Sony oferă dinamică uriașă. Calibrările aliniază tenul direct la axa 10:30 și curăță albul rochiei fără deviații galbene.',
      balances: [
        {
          id: 'slog3-daylight',
          name: 'Soare Direct 5600K S-Log3 Neutru',
          category: 'daylight',
          kelvinLabel: '5600K Pure Cine',
          temp: 0,
          tint: 1,
          description: 'Cer albastru pur, rochie albă fără reflexii calde și contrast echilibrat de zi.',
          icon: <Sun className="w-3.5 h-3.5 text-blue-400" />,
          patch: { inputSpace: 'slog3', saturation: 1.06, colorBoost: 8, highlights: -12, shadows: 0 },
        },
        {
          id: 'slog3-skintone',
          name: 'Ton Piele Curat & Sănătos 10:30',
          category: 'skin',
          kelvinLabel: 'S-Cinetone Pure',
          temp: 3,
          tint: 2,
          description: 'Ton natural catifelat, obrajii căpătând nuanța optimă de piersică și roz sănătos.',
          icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
          patch: { inputSpace: 'slog3', saturation: 1.10, colorBoost: 12, highlights: -14, shadows: 0, gain: { r: 1.04, g: 1.01, b: 0.96 } },
        },
        {
          id: 'slog3-shade',
          name: 'Umbră Sub Copaci / Cer 7000K',
          category: 'daylight',
          kelvinLabel: '7000K Cer Senin',
          temp: 15,
          tint: 3,
          description: 'Înlătură nuanța albăstruie de sub coronamentul copacilor, menținând pielea caldă.',
          icon: <CloudSun className="w-3.5 h-3.5 text-blue-300" />,
          patch: { inputSpace: 'slog3', saturation: 1.08, colorBoost: 10, highlights: -14, shadows: 2 },
        },
        {
          id: 'slog3-overcast',
          name: 'Cer Acoperit & Iluminare Difuză',
          category: 'daylight',
          kelvinLabel: '6200K Difuz',
          temp: 8,
          tint: 2,
          description: 'Lumină de zi moale, cu detalii clare în texturile de mătase și dantelă.',
          icon: <Cloud className="w-3.5 h-3.5 text-slate-300" />,
          patch: { inputSpace: 'slog3', saturation: 1.06, colorBoost: 8, highlights: -10, whites: -3, shadows: 0 },
        },
        {
          id: 'slog3-nature',
          name: 'Natură & Grădină (Anti-Neon Green)',
          category: 'nature',
          kelvinLabel: 'Smarald Natural',
          temp: 4,
          tint: -3,
          description: 'Calibrează verdele din parcuri și grădini pentru a preveni devierea spre galben-neon.',
          icon: <TreePine className="w-3.5 h-3.5 text-emerald-400" />,
          patch: { inputSpace: 'slog3', saturation: 1.08, colorBoost: 10, highlights: -16, shadows: 2, hueVsSat: { red: 10, yellow: -10, green: -20, cyan: 4, blue: 6, magenta: -4 } },
        },
        {
          id: 'slog3-deepforest',
          name: 'Pădure Conifere & Smarald',
          category: 'nature',
          kelvinLabel: 'Pădure Răcoroasă',
          temp: 2,
          tint: -5,
          description: 'Nuanțe dense de smarald și pământ, cu ten impecabil izolat de fundal.',
          icon: <TreePine className="w-3.5 h-3.5 text-teal-400" />,
          patch: { inputSpace: 'slog3', saturation: 1.08, colorBoost: 8, highlights: -16, shadows: 2 },
        },
        {
          id: 'slog3-sunrise',
          name: 'Răsărit & Raze Matinale',
          category: 'sunset',
          kelvinLabel: 'Răsărit 4800K',
          temp: -3,
          tint: 2,
          description: 'Cadre la prima oră: contrast curat fără saturație forțată pe pomeți.',
          icon: <Sun className="w-3.5 h-3.5 text-blue-300" />,
          patch: { inputSpace: 'slog3', saturation: 1.06, colorBoost: 8, highlights: -12, shadows: 0 },
        },
        {
          id: 'slog3-sunset',
          name: 'Apus Golden Hour Spectaculos',
          category: 'sunset',
          kelvinLabel: 'Golden Sunset',
          temp: 20,
          tint: 3,
          description: 'Strălucire auriu-miere la apus, cu flare-uri calde și gamă dinamică amplă.',
          icon: <Sunset className="w-3.5 h-3.5 text-amber-500" />,
          patch: { inputSpace: 'slog3', saturation: 1.14, colorBoost: 14, highlights: -20, shadows: -4, gain: { r: 1.07, g: 1.02, b: 0.94 } },
        },
        {
          id: 'slog3-bluehour',
          name: 'Ora Albastră / Seară Cinematică',
          category: 'sunset',
          kelvinLabel: 'Amurg Cinematic',
          temp: 12,
          tint: -1,
          description: 'Albastru profund pe cerul serii cu ten luminos și clar pe miri.',
          icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
          patch: { inputSpace: 'slog3', saturation: 1.10, colorBoost: 12, highlights: -14, shadows: -2 },
        },
        {
          id: 'slog3-window',
          name: 'Lumină Fereastră Pregătiri Nuntă',
          category: 'skin',
          kelvinLabel: 'Portret Mătăsos',
          temp: 2,
          tint: 2,
          description: 'Roll-off mătăsos la fereastră în camera miresei, ten radiant fără luciu excesiv.',
          icon: <Heart className="w-3.5 h-3.5 text-rose-300" />,
          patch: { inputSpace: 'slog3', saturation: 1.08, colorBoost: 10, highlights: -14, whites: -4, shadows: 2 },
        },
        {
          id: 'slog3-church',
          name: 'Biserică & Lumină Tradițională',
          category: 'interior',
          kelvinLabel: 'Interior Solemn',
          temp: -10,
          tint: 4,
          description: 'Echilibrează vitraliile reci cu lumânările calde, fără arderea detaliilor fine.',
          icon: <Cross className="w-3.5 h-3.5 text-purple-400" />,
          patch: { inputSpace: 'slog3', saturation: 1.06, colorBoost: 8, highlights: -18, shadows: 4 },
        },
        {
          id: 'slog3-hall-led',
          name: 'Sală Eveniment & Lumini RGB',
          category: 'interior',
          kelvinLabel: 'DJ Party Guard',
          temp: -10,
          tint: -8,
          description: 'Calmează reflectoarele RGB și luminile stroboscopice pe ringul de dans.',
          icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
          patch: { inputSpace: 'slog3', saturation: 1.04, colorBoost: 6, highlights: -16, shadows: 2 },
        },
      ],
    },
    {
      id: 'clog3',
      inputSpace: 'clog3',
      name: 'Canon Cinema EOS C70 / C300 / R5C',
      shortName: 'Canon Cinema EOS',
      sensor: 'Super35 DGO / Full-Frame · Canon Cinema Gamut',
      accentColor: '#dc2626',
      correctionTip: 'Senzorii Canon Cinema cu tehnologie DGO redau o latitudine de expunere excepțională. Calibrările conservă bogăția organică pe ten și albul pur al rochiei.',
      balances: [
        {
          id: 'clog3-daylight',
          name: 'Soare Direct 5600K Cinema Neutru',
          category: 'daylight',
          kelvinLabel: '5600K Cinema',
          temp: 0,
          tint: -1,
          description: 'Echilibru de zi exterior pentru Cinema Gamut: culori neutre fără tentă caldă artificială.',
          icon: <Sun className="w-3.5 h-3.5 text-red-500" />,
          patch: { inputSpace: 'clog3', saturation: 1.06, colorBoost: 6, highlights: -12, shadows: 0 },
        },
        {
          id: 'clog3-skintone',
          name: 'Ton Piele Cinema Canon Natural',
          category: 'skin',
          kelvinLabel: 'Cinema Skin 10:30',
          temp: 2,
          tint: 0,
          description: 'Piele catifelată cu nuanță roz-aurie organică conform standardelor cinematografice.',
          icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
          patch: { inputSpace: 'clog3', saturation: 1.08, colorBoost: 8, highlights: -14, whites: -4, shadows: 2, gain: { r: 1.03, g: 1.01, b: 0.97 } },
        },
        {
          id: 'clog3-shade',
          name: 'Umbră Deschisă & Cer Senin 6800K',
          category: 'daylight',
          kelvinLabel: '6800K Umbră',
          temp: 14,
          tint: 0,
          description: 'Compensare curată pentru umbrele sub cer senin, protejând tenul de răceala albastră.',
          icon: <CloudSun className="w-3.5 h-3.5 text-red-300" />,
          patch: { inputSpace: 'clog3', saturation: 1.06, colorBoost: 8, highlights: -14, shadows: 2 },
        },
        {
          id: 'clog3-overcast',
          name: 'Lumină Difuză de Zi (Noros)',
          category: 'daylight',
          kelvinLabel: '6200K Difuz',
          temp: 7,
          tint: -1,
          description: 'Claritate cristalină și contrast blând în zilele cu cer parțial noros.',
          icon: <Cloud className="w-3.5 h-3.5 text-slate-300" />,
          patch: { inputSpace: 'clog3', saturation: 1.05, colorBoost: 7, highlights: -10, whites: -2, shadows: 2 },
        },
        {
          id: 'clog3-garden',
          name: 'Cununie în Natură & Parc Verde',
          category: 'nature',
          kelvinLabel: 'Verde Parc',
          temp: 3,
          tint: -4,
          description: 'Păstrează tenul curat și calmează vegetația saturată pentru un cadru armonios.',
          icon: <TreePine className="w-3.5 h-3.5 text-emerald-400" />,
          patch: { inputSpace: 'clog3', saturation: 1.06, colorBoost: 8, highlights: -16, shadows: 2, hueVsSat: { red: 6, yellow: -6, green: -22, cyan: 4, blue: 4, magenta: -4 } },
        },
        {
          id: 'clog3-forest',
          name: 'Pădure Adâncă & Tonalitate Smarald',
          category: 'nature',
          kelvinLabel: 'Smarald Botanic',
          temp: 2,
          tint: -5,
          description: 'Nuanțe organice de pădure cu contrast elegant pe costumul mirelui.',
          icon: <TreePine className="w-3.5 h-3.5 text-teal-400" />,
          patch: { inputSpace: 'clog3', saturation: 1.07, colorBoost: 8, highlights: -18, shadows: 4 },
        },
        {
          id: 'clog3-sunrise',
          name: 'Răsărit de Soare & Atmosferă Clară',
          category: 'sunset',
          kelvinLabel: 'Matinal Clar',
          temp: -4,
          tint: 0,
          description: 'Lumină proaspătă și curată la începutul ceremoniei.',
          icon: <Sun className="w-3.5 h-3.5 text-red-300" />,
          patch: { inputSpace: 'clog3', saturation: 1.06, colorBoost: 6, highlights: -12, shadows: 0 },
        },
        {
          id: 'clog3-sunset',
          name: 'Apus Cinematic Auriu',
          category: 'sunset',
          kelvinLabel: 'Golden Amber',
          temp: 18,
          tint: 1,
          description: 'Nuanțe bogate de chihlimbar la apus cu roll-off catifelat pe fața miresei.',
          icon: <Sunset className="w-3.5 h-3.5 text-amber-500" />,
          patch: { inputSpace: 'clog3', saturation: 1.12, colorBoost: 12, highlights: -18, shadows: -2, gain: { r: 1.06, g: 1.02, b: 0.95 } },
        },
        {
          id: 'clog3-bluehour',
          name: 'Ora Albastră & Amurg Mătăsos',
          category: 'sunset',
          kelvinLabel: 'Amurg Mătăsos',
          temp: 12,
          tint: -2,
          description: 'Cer albastru adânc și iluminare caldă romantică pe ringul de dans în aer liber.',
          icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
          patch: { inputSpace: 'clog3', saturation: 1.08, colorBoost: 10, highlights: -14, shadows: 0 },
        },
        {
          id: 'clog3-window',
          name: 'Fereastră / Portret Cadru Natural',
          category: 'skin',
          kelvinLabel: 'Portret Mătăsos',
          temp: 1,
          tint: 0,
          description: 'Lumină naturală de fereastră cu tranziție lină și ten radiant fără strălucire grasă.',
          icon: <Heart className="w-3.5 h-3.5 text-rose-300" />,
          patch: { inputSpace: 'clog3', saturation: 1.06, colorBoost: 8, highlights: -14, whites: -4, shadows: 2 },
        },
        {
          id: 'clog3-church',
          name: 'Biserică Solemnă & Candelabre',
          category: 'interior',
          kelvinLabel: 'Ambient Biserică',
          temp: -8,
          tint: 2,
          description: 'Detaliu în picturile bisericii, protejând căldura lumânărilor fără nuanțe congestionate.',
          icon: <Cross className="w-3.5 h-3.5 text-purple-400" />,
          patch: { inputSpace: 'clog3', saturation: 1.04, colorBoost: 6, highlights: -16, shadows: 4 },
        },
        {
          id: 'clog3-hall-led',
          name: 'Sală Recepție & Spectacol LED',
          category: 'interior',
          kelvinLabel: 'Lumini Mixte',
          temp: -8,
          tint: -4,
          description: 'Echilibru calibrare lumini calde și lasere reci pe ringul de dans.',
          icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
          patch: { inputSpace: 'clog3', saturation: 1.05, colorBoost: 6, highlights: -16, shadows: 2 },
        },
      ],
    },
    {
      id: 'logc3',
      inputSpace: 'logc3',
      name: 'ARRI ALEXA Mini / LF / Amira',
      shortName: 'ARRI ALEXA LogC3',
      sensor: '35mm ALEV III · Etalonul Mondial de Culoare & Roll-off',
      accentColor: '#14b8a6',
      correctionTip: 'Senzorul ARRI ALEV III este etalonul aur în cinematografie pentru reproducerea tenului și roll-off-ul luminilor. Calibrările oferă culori naturale fără artefacte.',
      balances: [
        {
          id: 'logc3-daylight',
          name: 'Soare Direct 5600K ARRI Referință',
          category: 'daylight',
          kelvinLabel: '5600K ARRI Pure',
          temp: 0,
          tint: 0,
          description: 'Punct de referință pur de zi: rochia de mireasă nu arde, cerul este curat și culorile fidele.',
          icon: <Sun className="w-3.5 h-3.5 text-teal-400" />,
          patch: { inputSpace: 'logc3', saturation: 1.06, colorBoost: 6, highlights: -12, shadows: 0 },
        },
        {
          id: 'logc3-skintone',
          name: 'Ton Piele Organic ARRI Look',
          category: 'skin',
          kelvinLabel: 'ARRI Skin Magic',
          temp: 2,
          tint: 0,
          description: 'Tonul legendar ARRI pe ten: textură vie a pielii, nuanțe catifelate și tranziții imperceptibile.',
          icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
          patch: { inputSpace: 'logc3', saturation: 1.08, colorBoost: 8, highlights: -14, shadows: 2, gain: { r: 1.03, g: 1.01, b: 0.97 } },
        },
        {
          id: 'logc3-shade',
          name: 'Umbră & Lumină Rece 6800K',
          category: 'daylight',
          kelvinLabel: '6800K Umbră',
          temp: 14,
          tint: 1,
          description: 'Compensare pentru umbre exterioare cu menținerea purității albului.',
          icon: <CloudSun className="w-3.5 h-3.5 text-teal-300" />,
          patch: { inputSpace: 'logc3', saturation: 1.06, colorBoost: 8, highlights: -12, shadows: 2 },
        },
        {
          id: 'logc3-overcast',
          name: 'Cer Noros & Lumină Moale Difuză',
          category: 'daylight',
          kelvinLabel: '6000K Moale',
          temp: 7,
          tint: 0,
          description: 'Lumină fină difuză de nori, cu contrast pictural pe rochie și costum.',
          icon: <Cloud className="w-3.5 h-3.5 text-slate-300" />,
          patch: { inputSpace: 'logc3', saturation: 1.05, colorBoost: 6, highlights: -10, whites: -2, shadows: 2 },
        },
        {
          id: 'logc3-garden',
          name: 'Natură & Frunziș Organic Cine',
          category: 'nature',
          kelvinLabel: 'Verde Nobil',
          temp: 3,
          tint: -3,
          description: 'Verde vegetal nobil și cald, tenul mirilor rămânând curat și luminos.',
          icon: <TreePine className="w-3.5 h-3.5 text-emerald-400" />,
          patch: { inputSpace: 'logc3', saturation: 1.06, colorBoost: 8, highlights: -14, shadows: 2 },
        },
        {
          id: 'logc3-forest',
          name: 'Pădure & Vegetație Nobilă',
          category: 'nature',
          kelvinLabel: 'Pădure Smarald',
          temp: 2,
          tint: -4,
          description: 'Tonalitate profundă de pădure cu separare precisă a subiectelor.',
          icon: <TreePine className="w-3.5 h-3.5 text-teal-400" />,
          patch: { inputSpace: 'logc3', saturation: 1.07, colorBoost: 8, highlights: -16, shadows: 4 },
        },
        {
          id: 'logc3-sunrise',
          name: 'Răsărit Matinal Pur',
          category: 'sunset',
          kelvinLabel: 'Matinal ARRI',
          temp: -3,
          tint: 0,
          description: 'Lumină proaspătă și aerisită pentru începutul poveștii vizuale.',
          icon: <Sun className="w-3.5 h-3.5 text-teal-300" />,
          patch: { inputSpace: 'logc3', saturation: 1.05, colorBoost: 6, highlights: -10, shadows: 0 },
        },
        {
          id: 'logc3-sunset',
          name: 'Apus Auriu Hollywood Amber',
          category: 'sunset',
          kelvinLabel: 'Hollywood Amber',
          temp: 18,
          tint: 2,
          description: 'Apus cald de referință cu flare-uri catifelate și textură impecabilă pe voal.',
          icon: <Sunset className="w-3.5 h-3.5 text-amber-500" />,
          patch: { inputSpace: 'logc3', saturation: 1.12, colorBoost: 12, highlights: -18, shadows: -2, gain: { r: 1.06, g: 1.02, b: 0.95 } },
        },
        {
          id: 'logc3-bluehour',
          name: 'Ora Albastră ARRI Twilight',
          category: 'sunset',
          kelvinLabel: 'ARRI Twilight',
          temp: 12,
          tint: 0,
          description: 'Contrast cinematografic fin de amurg cu adâncime de culoare impresionantă.',
          icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
          patch: { inputSpace: 'logc3', saturation: 1.08, colorBoost: 10, highlights: -14, shadows: 0 },
        },
        {
          id: 'logc3-window',
          name: 'Lumină de Fereastră / Cadru Natural',
          category: 'skin',
          kelvinLabel: 'Portret Pictural',
          temp: 1,
          tint: 1,
          description: 'Tranziție catifelată pe ten, ten luminos și reflexii blânde în ochi.',
          icon: <Heart className="w-3.5 h-3.5 text-rose-300" />,
          patch: { inputSpace: 'logc3', saturation: 1.06, colorBoost: 8, highlights: -12, whites: -4, shadows: 2 },
        },
        {
          id: 'logc3-church',
          name: 'Biserică & Lumânări / Vitralii',
          category: 'interior',
          kelvinLabel: 'Sacred Dynamic',
          temp: -8,
          tint: 4,
          description: 'Detaliu maxim în zonele umbrite ale bisericii cu protecție pe flăcări.',
          icon: <Cross className="w-3.5 h-3.5 text-purple-400" />,
          patch: { inputSpace: 'logc3', saturation: 1.04, colorBoost: 6, highlights: -16, shadows: 4 },
        },
        {
          id: 'logc3-hall-led',
          name: 'Sală Festivă & Ambiant Nocturn',
          category: 'interior',
          kelvinLabel: 'Sală Eveniment',
          temp: -6,
          tint: -4,
          description: 'Păstrează fețele naturale chiar sub reflectoare saturate și lumini LED de petrecere.',
          icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
          patch: { inputSpace: 'logc3', saturation: 1.04, colorBoost: 6, highlights: -16, shadows: 2 },
        },
      ],
    },
    {
      id: 'rec709',
      inputSpace: 'rec709',
      name: 'Camcordere & Mirrorless Rec.709 Standard',
      shortName: 'Rec.709 Standard',
      sensor: 'Senzori Video Broadcast Rec.709 · Calibrare Instantanee',
      accentColor: '#10b981',
      correctionTip: 'Standardul internațional Rec.709 este utilizat pe marea majoritate a camerelor broadcast și a profilelor standard fără log. Calibrările aduc culori vii, contrast corect și un ten cald.',
      balances: [
        {
          id: 'rec709-daylight',
          name: 'Soare Direct 5600K Neutru Calibrat',
          category: 'daylight',
          kelvinLabel: '5600K Rec.709',
          temp: 0,
          tint: 0,
          description: 'Echilibru 100% neutru conform ITU-R BT.709: alb imaculat pe rochie și cer cristalin.',
          icon: <Sun className="w-3.5 h-3.5 text-emerald-400" />,
          patch: { inputSpace: 'rec709', saturation: 1.04, colorBoost: 6, highlights: -10, shadows: 0 },
        },
        {
          id: 'rec709-skintone',
          name: 'Ton Natural Ten 10:30 Rec.709',
          category: 'skin',
          kelvinLabel: 'Melanină 10:30',
          temp: 2,
          tint: 1,
          description: 'Aducere pe axa optimă a vectorscopului a hemoglobinei și melaninei pentru ten sănătos.',
          icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
          patch: { inputSpace: 'rec709', saturation: 1.06, colorBoost: 8, highlights: -12, whites: -3, shadows: 2, gain: { r: 1.03, g: 1.01, b: 0.97 } },
        },
        {
          id: 'rec709-shade',
          name: 'Umbră & Cer Noros 6500K - 7500K',
          category: 'daylight',
          kelvinLabel: '6500K - 7500K',
          temp: 14,
          tint: 2,
          description: 'Compensează tenta albastră a umbrei sub copaci, menținând pielea caldă.',
          icon: <CloudSun className="w-3.5 h-3.5 text-emerald-300" />,
          patch: { inputSpace: 'rec709', saturation: 1.05, colorBoost: 8, highlights: -12, shadows: 2 },
        },
        {
          id: 'rec709-overcast',
          name: 'Cer Acoperit Lumină Moale',
          category: 'daylight',
          kelvinLabel: '6000K Moale',
          temp: 8,
          tint: 1,
          description: 'Lumină difuză și uniformă, potrivită pentru portrete în exterior fără umbre dure.',
          icon: <Cloud className="w-3.5 h-3.5 text-slate-300" />,
          patch: { inputSpace: 'rec709', saturation: 1.04, colorBoost: 6, highlights: -8, whites: -2, shadows: 2 },
        },
        {
          id: 'rec709-garden',
          name: 'Cununie în Natură & Verdeață',
          category: 'nature',
          kelvinLabel: 'Natură / Parc',
          temp: 4,
          tint: -3,
          description: 'Temperează reflexia verzuie a ierbii de pe bărbia și obrajii mirilor.',
          icon: <TreePine className="w-3.5 h-3.5 text-emerald-400" />,
          patch: { inputSpace: 'rec709', saturation: 1.05, colorBoost: 8, highlights: -14, shadows: 2, hueVsSat: { red: 6, yellow: -6, green: -20, cyan: 4, blue: 4, magenta: -4 } },
        },
        {
          id: 'rec709-forest',
          name: 'Pădure & Smarald Calm',
          category: 'nature',
          kelvinLabel: 'Pădure Calmă',
          temp: 2,
          tint: -4,
          description: 'Vegetație densă redată cu tonuri sobre de verde organic.',
          icon: <TreePine className="w-3.5 h-3.5 text-teal-400" />,
          patch: { inputSpace: 'rec709', saturation: 1.06, colorBoost: 6, highlights: -16, shadows: 4 },
        },
        {
          id: 'rec709-sunrise',
          name: 'Răsărit de Soare Cald',
          category: 'sunset',
          kelvinLabel: '4600K Matinal',
          temp: -4,
          tint: 1,
          description: 'Lumină curată de dimineață cu echilibru fin între umbre și lumini.',
          icon: <Sun className="w-3.5 h-3.5 text-emerald-300" />,
          patch: { inputSpace: 'rec709', saturation: 1.04, colorBoost: 6, highlights: -10, shadows: 0 },
        },
        {
          id: 'rec709-sunset',
          name: 'Apus / Golden Hour Cald',
          category: 'sunset',
          kelvinLabel: 'Golden Hour 3500K',
          temp: 20,
          tint: 2,
          description: 'Căldură romantică de apus cu nuanțe de miere pe păr și pe voalul miresei.',
          icon: <Sunset className="w-3.5 h-3.5 text-amber-500" />,
          patch: { inputSpace: 'rec709', saturation: 1.10, colorBoost: 12, highlights: -16, shadows: -2 },
        },
        {
          id: 'rec709-bluehour',
          name: 'Ora Albastră / Amurg',
          category: 'sunset',
          kelvinLabel: 'Amurg Calmat',
          temp: 12,
          tint: -1,
          description: 'Cer nocturn albăstrui elegant, contrast mătăsos pe miri.',
          icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
          patch: { inputSpace: 'rec709', saturation: 1.08, colorBoost: 10, highlights: -14, shadows: 0 },
        },
        {
          id: 'rec709-window',
          name: 'Lumină Naturală Fereastră',
          category: 'skin',
          kelvinLabel: 'Portret Fereastră',
          temp: 2,
          tint: 2,
          description: 'Portret la fereastră în interior: treceri fine și ton catifelat al tenului.',
          icon: <Heart className="w-3.5 h-3.5 text-rose-300" />,
          patch: { inputSpace: 'rec709', saturation: 1.05, colorBoost: 8, highlights: -12, whites: -4, shadows: 2 },
        },
        {
          id: 'rec709-church',
          name: 'Biserică & Ceremonie Religioasă',
          category: 'interior',
          kelvinLabel: 'Slujbă Religioasă',
          temp: -8,
          tint: 4,
          description: 'Atenuează reflexiile pe icoane și aur menținând solemnitatea slujbei.',
          icon: <Cross className="w-3.5 h-3.5 text-purple-400" />,
          patch: { inputSpace: 'rec709', saturation: 1.04, colorBoost: 6, highlights: -16, shadows: 4 },
        },
        {
          id: 'rec709-hall-led',
          name: 'Sală Nuntă & Lumini LED',
          category: 'interior',
          kelvinLabel: 'Lumini Mixte Sală',
          temp: -6,
          tint: -4,
          description: 'Neutralizează reflectoarele LED și lumina mixtă din restaurant.',
          icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
          patch: { inputSpace: 'rec709', saturation: 1.04, colorBoost: 6, highlights: -16, whites: -6, shadows: 2 },
        },
      ],
    },
  ];

  const selectedCam = cameraGroups.find((c) => c.id === selectedCameraId) || cameraGroups[0];

  // 10 Diverse Balance Modes including rich natural light scenarios
  const balanceModes: BalanceMode[] = [
    {
      id: 'daylight-natural',
      name: 'Soare Direct (Natural Pur)',
      category: 'natural',
      kelvinLabel: '5600K',
      temp: 0,
      tint: 0,
      description: 'Lumină solară directă neutră, fără tentă galbenă sau albastră.',
      icon: <Sun className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      id: 'shade-overcast',
      name: 'Umbră & Cer Noros',
      category: 'natural',
      kelvinLabel: '6500K - 7500K',
      temp: 14,
      tint: 2,
      description: 'Compensează albastrul rece al umbrei sub copaci sau cer acoperit.',
      icon: <CloudSun className="w-3.5 h-3.5 text-sky-400" />,
    },
    {
      id: 'golden-sunset',
      name: 'Apus / Golden Hour',
      category: 'natural',
      kelvinLabel: '3200K - 4000K',
      temp: 24,
      tint: 3,
      description: 'Radiație caldă organică de miere și apus auriu pentru ședințe foto.',
      icon: <Sunset className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'foliage-nature',
      name: 'Pădure & Verdeață',
      category: 'natural',
      kelvinLabel: 'Natură / Reflexie',
      temp: 6,
      tint: -6,
      description: 'Elimină reflexia verzuie a ierbii și frunzelor de pe tenul mirilor.',
      icon: <TreePine className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      id: 'skin-priority',
      name: 'Ton Natural de Piele',
      category: 'natural',
      kelvinLabel: 'Melanină 10:30',
      temp: 6,
      tint: 4,
      description: 'Aliniere optimă a tenului direct pe linia de vectorscop Skin Tone.',
      icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
    },
    {
      id: 'tungsten-warm',
      name: 'Incandescent / Bec Cald',
      category: 'interior',
      kelvinLabel: '2800K - 3200K',
      temp: -18,
      tint: 4,
      description: 'Compensează lumina galben-portocalie din restaurante și săli.',
      icon: <Flame className="w-3.5 h-3.5 text-orange-400" />,
    },
    {
      id: 'church-ambient',
      name: 'Biserică & Candelabre',
      category: 'interior',
      kelvinLabel: 'Sacred Ambient',
      temp: -10,
      tint: 6,
      description: 'Echilibru solemn pentru picturi, vitralii și lumânări în biserică.',
      icon: <Cross className="w-3.5 h-3.5 text-purple-400" />,
    },
    {
      id: 'fluorescent-office',
      name: 'Neon & Fluorescent',
      category: 'interior',
      kelvinLabel: 'Cool White 4000K',
      temp: 6,
      tint: 18,
      description: 'Corectează tenta verzuie agresivă a tuburilor de neon.',
      icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
    },
    {
      id: 'dancefloor-led',
      name: 'Ring de Dans DJ LED',
      category: 'correction',
      kelvinLabel: 'Party Lights',
      temp: -8,
      tint: -12,
      description: 'Temperează exploziile de magenta și albastru fluorescent de la petrecere.',
      icon: <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />,
    },
    {
      id: 'studio-calibrated',
      name: 'Studio Calibrat',
      category: 'correction',
      kelvinLabel: 'Referință Neutră',
      temp: 0,
      tint: 0,
      description: 'Punct de referință pur 100% neutru conform standardului Rec.709.',
      icon: <Palette className="w-3.5 h-3.5 text-slate-300" />,
    },
  ];

  return (
    <div className="space-y-4 select-none">
      {/* Top Bar with Expand/Collapse All and Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151922] p-3.5 rounded-xl border border-[#232a38]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Panou Ajustări Primare (Meniu Desfășurător pe Rubrici)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExpandAll}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-[#1e2534] hover:bg-[#283347] text-slate-300 hover:text-white rounded border border-[#2d3a50] transition-colors"
            title="Desfășoară toate rubricile"
          >
            <Maximize2 className="w-3 h-3 text-amber-400" />
            <span>Desfășoară Tot</span>
          </button>

          <button
            onClick={handleCollapseAll}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-[#1e2534] hover:bg-[#283347] text-slate-300 hover:text-white rounded border border-[#2d3a50] transition-colors"
            title="Restrânge toate rubricile pentru a economisi spațiu pe ecran"
          >
            <Minimize2 className="w-3 h-3 text-slate-400" />
            <span>Restrânge Tot</span>
          </button>

          <button
            onClick={onResetPrimaries}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 rounded border border-rose-800/40 transition-colors ml-1"
            title="Resetează toți parametrii primari la valorile standard"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Toate</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RUBRICA 1: BALANS CROMATIC & MODURI DE BALANS NATURALE */}
      {/* ========================================================================= */}
      <div className="bg-[#151922] rounded-xl border border-[#232a38] overflow-hidden transition-all">
        {/* Accordion Header */}
        <button
          onClick={() => toggleRubric('rubric1')}
          className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-[#1a202c] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/30">
              1
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Rubrica 1: Balans Cromatic & Profiluri Camere Video
                </h4>
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
                  108 Balansuri Naturale (9 Sisteme Camere)
                </span>
              </div>
              {!openRubrics.rubric1 && (
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Cameră: <span className="text-amber-300 uppercase">{state.inputSpace || 'rec709'}</span> | Temp: <span className="text-amber-300">{state.temperature > 0 ? `+${state.temperature}` : state.temperature}</span> | Tint: <span className="text-pink-300">{state.tint > 0 ? `+${state.tint}` : state.tint}</span> | Sat: <span className="text-slate-200">{state.saturation.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRubric('rubric1');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#1e2738] hover:bg-[#28354c] text-amber-300 rounded-lg border border-amber-500/40 transition-colors shadow-sm"
              title={openRubrics.rubric1 ? 'Restrânge complet Rubrica 1' : 'Desfășoară Rubrica 1'}
            >
              {openRubrics.rubric1 ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Restrânge Rubrica 1</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Desfășoară Rubrica 1</span>
                </>
              )}
            </button>
            <div className={`p-1.5 rounded-md bg-[#1f2736] text-slate-300 transition-transform duration-200 ${openRubrics.rubric1 ? 'rotate-180 text-amber-400' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>

        {/* Accordion Body */}
        {openRubrics.rubric1 && (
          <div className="p-4 pt-2 border-t border-[#212735] space-y-4 animate-in fade-in duration-150">
            {/* Sub-Tab Switcher: Camere Video vs Mediu General */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#212837] pb-3">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#121622] rounded-lg border border-[#212b3d]">
                <button
                  onClick={() => setBalanceSubTab('cameras')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    balanceSubTab === 'cameras'
                      ? 'bg-gradient-to-r from-amber-500/25 to-rose-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Balansuri Camere Video (9 Sisteme · GH5 · UX90 · FX30 · R6 · BMPCC · S-Log3 · C-Log3 · LogC3 · Rec.709)</span>
                </button>

                <button
                  onClick={() => setBalanceSubTab('environmental')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    balanceSubTab === 'environmental'
                      ? 'bg-gradient-to-r from-sky-500/25 to-indigo-500/25 text-sky-300 border border-sky-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-sky-400" />
                  <span>Mediu & Lumină Naturală (10 Moduri Generale)</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="text-slate-500">Cameră Activă:</span>
                <span className="text-amber-400 font-bold bg-[#18202d] px-2 py-0.5 rounded border border-[#273347] uppercase">
                  {state.inputSpace || 'rec709'}
                </span>
              </div>
            </div>

            {/* TAB A: CAMERE VIDEO GRUPATE & ACORDEOANE CU BUTOANE DE RESTRÂNGERE */}
            {balanceSubTab === 'cameras' && (
              <div className="space-y-3.5">
                {/* Brand & Camera Grouping Toolbar + Collapse Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11151f] p-3 rounded-xl border border-[#222b3d]">
                  {/* Left: Brand Grouping Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mr-1">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>Grupează după Camere:</span>
                    </span>

                    {[
                      { id: 'all', label: `Toate (${cameraGroups.length} Camere)` },
                      { id: 'panasonic', label: 'Panasonic (2)' },
                      { id: 'sony', label: 'Sony (2)' },
                      { id: 'canon', label: 'Canon (2)' },
                      { id: 'blackmagic', label: 'Blackmagic (1)' },
                      { id: 'arri', label: 'ARRI (1)' },
                      { id: 'broadcast', label: 'Broadcast (1)' },
                    ].map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => setBrandFilter(brand.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          brandFilter === brand.id
                            ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm ring-1 ring-amber-500/20'
                            : 'bg-[#161c28] text-slate-400 hover:text-slate-200 border border-[#232d3d]'
                        }`}
                      >
                        {brand.label}
                      </button>
                    ))}
                  </div>

                  {/* Right: Expand/Collapse All Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleExpandAllCameras}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-[#18202d] hover:bg-[#222c3d] text-slate-300 hover:text-white rounded-lg border border-[#2b374c] transition-colors"
                      title="Desfășoară toate grupurile de camere"
                    >
                      <ChevronDown className="w-3 h-3 text-amber-400" />
                      <span>Desfășoară Toate</span>
                    </button>

                    <button
                      onClick={handleCollapseAllCameras}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-[#18202d] hover:bg-[#222c3d] text-slate-300 hover:text-white rounded-lg border border-[#2b374c] transition-colors"
                      title="Restrânge toate grupurile de camere"
                    >
                      <Minimize2 className="w-3 h-3 text-slate-400" />
                      <span>Restrânge Toate</span>
                    </button>

                    <button
                      onClick={() => toggleRubric('rubric1')}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 hover:text-rose-200 rounded-lg border border-rose-800/40 transition-colors ml-1"
                      title="Restrânge complet Rubrica 1"
                    >
                      <Minimize2 className="w-3 h-3" />
                      <span>Restrânge Rubrica 1</span>
                    </button>
                  </div>
                </div>

                {/* Filtered Camera Groups Accordion List (Grouped by Camera) */}
                <div className="space-y-3">
                  {(brandFilter === 'all'
                    ? cameraGroups
                    : cameraGroups.filter((cam) => getCameraBrand(cam.id).id === brandFilter)
                  ).map((cam) => {
                    const isExpanded = !!expandedCameras[cam.id];
                    const isCameraActive = state.inputSpace === cam.inputSpace;
                    const brandInfo = getCameraBrand(cam.id);

                    return (
                      <div
                        key={cam.id}
                        className={`rounded-xl border transition-all overflow-hidden ${
                          isCameraActive
                            ? 'bg-[#151a24] border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                            : 'bg-[#131722] border-[#222c3e]'
                        }`}
                      >
                        {/* Camera Group Header with individual Restrânge/Desfășoară button */}
                        <div
                          onClick={() => toggleCamera(cam.id)}
                          className="p-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-[#18202d] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: cam.accentColor }}
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-white tracking-wide">
                                  {cam.name}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c2434] text-slate-300 border border-[#2b374d]">
                                  {brandInfo.label}
                                </span>
                                {isCameraActive ? (
                                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Activ în DaVinci ({cam.inputSpace})
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-slate-400">
                                    Input: {cam.inputSpace}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                {cam.sensor} · {cam.balances.length} Balansuri Naturale Calibrate
                              </p>
                            </div>
                          </div>

                          {/* Right Header Actions: Select Camera & Restrânge / Desfășoară */}
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                onChange({ inputSpace: cam.inputSpace });
                                if (!isExpanded) toggleCamera(cam.id);
                              }}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                                isCameraActive
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                                  : 'bg-[#1b2332] hover:bg-[#253044] text-slate-300 border-[#2a364b]'
                              }`}
                              title={`Setează camera activă pe ${cam.name}`}
                            >
                              {isCameraActive ? '✓ Cameră Activă' : 'Activează Camera'}
                            </button>

                            <button
                              onClick={() => toggleCamera(cam.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-[#1e2738] hover:bg-[#28354c] text-slate-200 rounded-lg border border-[#2d3a50] transition-colors"
                              title={isExpanded ? `Restrânge grupul ${cam.shortName}` : `Desfășoară grupul ${cam.shortName}`}
                            >
                              <span>{isExpanded ? 'Restrânge' : `Desfășoară (${cam.balances.length})`}</span>
                              <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-amber-400' : ''}`}>
                                <ChevronDown className="w-3 h-3" />
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Camera Group Expanded Body */}
                        {isExpanded && (
                          <div className="p-3.5 pt-2 border-t border-[#202738] space-y-3 bg-[#111520] animate-in fade-in duration-150">
                            {/* Sensor tip */}
                            <div className="bg-[#151a26] p-2.5 rounded-lg border border-[#232d40] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                💡 <strong className="text-amber-300">{cam.shortName}:</strong> {cam.correctionTip}
                              </p>
                              <div className="shrink-0 text-[10px] font-mono text-slate-400 bg-[#1a2130] px-2 py-0.5 rounded border border-[#29364d]">
                                Transformare: <strong className="text-amber-400">{cam.inputSpace}</strong> → Rec.709 Gamma 2.4
                              </div>
                            </div>

                            {/* Natural Balances Grid (12 items) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                              {cam.balances.map((bal) => {
                                const isBalanceActive =
                                  state.inputSpace === cam.inputSpace &&
                                  state.temperature === bal.temp &&
                                  state.tint === bal.tint;

                                return (
                                  <button
                                    key={bal.id}
                                    onClick={() => {
                                      onChange({
                                        inputSpace: cam.inputSpace,
                                        temperature: bal.temp,
                                        tint: bal.tint,
                                        ...(bal.patch || {}),
                                      });
                                    }}
                                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 group ${
                                      isBalanceActive
                                        ? 'bg-amber-500/20 border-amber-500/70 shadow-md ring-1 ring-amber-500/30'
                                        : 'bg-[#151b27] hover:bg-[#1e2637] border-[#243043]'
                                    }`}
                                    title={bal.description}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {bal.icon}
                                        <span className={`text-xs font-bold ${isBalanceActive ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'}`}>
                                          {bal.name}
                                        </span>
                                      </div>
                                      {isBalanceActive && (
                                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-bold">
                                          ✓
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                                      {bal.description}
                                    </p>

                                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-[#232e42]">
                                      <span className="text-slate-300">{bal.kelvinLabel}</span>
                                      <div className="flex items-center gap-2">
                                        <span className={isBalanceActive ? 'text-amber-300 font-bold' : 'text-amber-400/80'}>
                                          T:{bal.temp > 0 ? `+${bal.temp}` : bal.temp}
                                        </span>
                                        <span className={isBalanceActive ? 'text-pink-300 font-bold' : 'text-pink-400/80'}>
                                          Tint:{bal.tint > 0 ? `+${bal.tint}` : bal.tint}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Quick Collapse Footer Link for this camera */}
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => toggleCamera(cam.id)}
                                className="text-[11px] font-medium text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                              >
                                <Minimize2 className="w-3 h-3" />
                                <span>Restrânge acest grup ({cam.shortName})</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB B: 10 GENERAL ENVIRONMENTAL BALANCES */}
            {balanceSubTab === 'environmental' && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Selectează un Mod Rapid de Balans (Naturale, Apus, Umbră, Biserică, Pădure):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {balanceModes.map((mode) => {
                    const isActive = state.temperature === mode.temp && state.tint === mode.tint;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => onChange({ temperature: mode.temp, tint: mode.tint })}
                        className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between gap-1 group ${
                          isActive
                            ? 'bg-amber-500/20 border-amber-500/60 shadow-sm'
                            : 'bg-[#181f2c] hover:bg-[#20293a] border-[#263143]'
                        }`}
                        title={mode.description}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {mode.icon}
                            <span className={`text-[11px] font-bold truncate ${isActive ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'}`}>
                              {mode.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-[#232c3c]">
                          <span>{mode.kelvinLabel}</span>
                          <span className={isActive ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                            {mode.temp > 0 ? `+${mode.temp}` : mode.temp}T
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fine Tuning Sliders: Temp, Tint, Saturation, Color Boost */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#1e2636]">
              {/* Temperature */}
              <div className="space-y-1.5 bg-[#18202d] p-3 rounded-lg border border-[#263145]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">Temperatură (Cald/Rece)</span>
                  <span className="font-mono text-amber-400 tabular-nums font-bold">
                    {state.temperature > 0 ? `+${state.temperature}` : state.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={state.temperature}
                  onChange={(e) => onChange({ temperature: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-gradient-to-r from-sky-500 via-slate-500 to-amber-500 accent-amber-300 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Rece (-100)</span>
                  <span>Neutru (0)</span>
                  <span>Cald (+100)</span>
                </div>
              </div>

              {/* Tint */}
              <div className="space-y-1.5 bg-[#18202d] p-3 rounded-lg border border-[#263145]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">Tint (Verde/Magenta)</span>
                  <span className="font-mono text-amber-400 tabular-nums font-bold">
                    {state.tint > 0 ? `+${state.tint}` : state.tint}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={state.tint}
                  onChange={(e) => onChange({ tint: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-gradient-to-r from-emerald-500 via-slate-500 to-pink-500 accent-pink-300 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Verde (-100)</span>
                  <span>Neutru (0)</span>
                  <span>Magenta (+100)</span>
                </div>
              </div>

              {/* Saturation */}
              <div className="space-y-1.5 bg-[#18202d] p-3 rounded-lg border border-[#263145]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">Saturație Globală</span>
                  <span className="font-mono text-amber-400 tabular-nums font-bold">
                    {state.saturation.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2.5"
                  step="0.02"
                  value={state.saturation}
                  onChange={(e) => onChange({ saturation: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-[#252f42] accent-amber-500 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Alb-Negru (0.0)</span>
                  <span>Standard (1.0)</span>
                  <span>Vivid (2.5)</span>
                </div>
              </div>

              {/* Color Boost */}
              <div className="space-y-1.5 bg-[#18202d] p-3 rounded-lg border border-[#263145]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">Color Boost (Vibrance)</span>
                  <span className="font-mono text-amber-400 tabular-nums font-bold">
                    {state.colorBoost > 0 ? `+${state.colorBoost}` : state.colorBoost}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={state.colorBoost}
                  onChange={(e) => onChange({ colorBoost: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-[#252f42] accent-amber-500 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Muted (-100)</span>
                  <span>0 Neutru</span>
                  <span>Protecție Ten (+100)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* RUBRICA 2: EXPUNERE, DINAMICĂ & CONTRAST (S-CURVE & PIVOT) */}
      {/* ========================================================================= */}
      <div className="bg-[#151922] rounded-xl border border-[#232a38] overflow-hidden transition-all">
        {/* Accordion Header */}
        <button
          onClick={() => toggleRubric('rubric2')}
          className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-[#1a202c] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold text-xs flex items-center justify-center border border-sky-500/30">
              2
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Rubrica 2: Expunere, Dinamică & Contrast (S-Curve & Pivot)
                </h4>
                <span className="bg-sky-500/10 text-sky-400 text-[10px] font-mono px-2 py-0.5 rounded border border-sky-500/20 font-semibold">
                  Gama Dinamică & Roll-off
                </span>
              </div>
              {!openRubrics.rubric2 && (
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Expunere: <span className="text-sky-300">{state.exposure.toFixed(2)} EV</span> | Contrast: <span className="text-amber-300">{state.contrast.toFixed(2)}</span> | Pivot: <span className="text-slate-200">{state.pivot.toFixed(3)}</span> | Highlights: <span className="text-slate-200">{state.highlights}</span> | Shadows: <span className="text-slate-200">{state.shadows}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {openRubrics.rubric2 ? 'Restrânge' : 'Desfășoară'}
            </span>
            <div className={`p-1 rounded-md bg-[#1f2736] text-slate-300 transition-transform duration-200 ${openRubrics.rubric2 ? 'rotate-180 text-sky-400' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>

        {/* Accordion Body */}
        {openRubrics.rubric2 && (
          <div className="p-4 pt-2 border-t border-[#212735] space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Exposure */}
              <div className="space-y-1.5 bg-[#18202d] p-3 rounded-lg border border-[#263145]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">Expunere (EV Stops)</span>
                  <span className="font-mono text-amber-400 tabular-nums font-bold">
                    {state.exposure > 0 ? `+${state.exposure.toFixed(2)}` : state.exposure.toFixed(2)} EV
                  </span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.05"
                  value={state.exposure}
                  onChange={(e) => onChange({ exposure: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-[#252f42] accent-amber-500 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>-3.0 EV</span>
                  <span>0.0 Normal</span>
                  <span>+3.0 EV</span>
                </div>
              </div>

              {/* Contrast */}
              <div className="space-y-1.5 bg-[#18202d] p-3 rounded-lg border border-[#263145]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">Contrast (S-Curve)</span>
                  <span className="font-mono text-amber-400 tabular-nums font-bold">
                    {state.contrast.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.02"
                  value={state.contrast}
                  onChange={(e) => onChange({ contrast: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-[#252f42] accent-amber-500 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Plat (0.50)</span>
                  <span>Standard (1.00)</span>
                  <span>Punchy (2.00)</span>
                </div>
              </div>

              {/* DaVinci Pivot */}
              <div className="space-y-1.5 bg-[#18202d] p-3 rounded-lg border border-[#263145]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">Pivot Contrast (DaVinci)</span>
                  <span className="font-mono text-amber-400 tabular-nums font-bold">
                    {state.pivot.toFixed(3)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.005"
                  value={state.pivot}
                  onChange={(e) => onChange({ pivot: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-[#252f42] accent-amber-500 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Umbre (0.10)</span>
                  <span>Standard (0.435)</span>
                  <span>Lumini (0.90)</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-1.5 bg-[#18202d] p-3 rounded-lg border border-[#263145]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">Highlights (Roll-off Rochie)</span>
                  <span className="font-mono text-amber-400 tabular-nums font-bold">
                    {state.highlights > 0 ? `+${state.highlights}` : state.highlights}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={state.highlights}
                  onChange={(e) => onChange({ highlights: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-[#252f42] accent-amber-500 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Recuperare (-100)</span>
                  <span>0 Neutru</span>
                  <span>Deschidere (+100)</span>
                </div>
              </div>

              {/* Shadows */}
              <div className="space-y-1.5 bg-[#18202d] p-3 rounded-lg border border-[#263145]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">Shadows (Detalii Smoking)</span>
                  <span className="font-mono text-amber-400 tabular-nums font-bold">
                    {state.shadows > 0 ? `+${state.shadows}` : state.shadows}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={state.shadows}
                  onChange={(e) => onChange({ shadows: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-[#252f42] accent-amber-500 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Adâncire (-100)</span>
                  <span>0 Neutru</span>
                  <span>Deschidere (+100)</span>
                </div>
              </div>

              {/* Whites & Blacks in pairs */}
              <div className="space-y-1.5 bg-[#18202d] p-3 rounded-lg border border-[#263145]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">Whites & Blacks</span>
                  <span className="font-mono text-amber-400 tabular-nums text-[11px]">
                    W:{state.whites} | B:{state.blacks}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={state.whites}
                    onChange={(e) => onChange({ whites: parseInt(e.target.value, 10) })}
                    className="w-full h-1 bg-[#252f42] accent-sky-400 rounded cursor-pointer"
                    title="Whites"
                  />
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={state.blacks}
                    onChange={(e) => onChange({ blacks: parseInt(e.target.value, 10) })}
                    className="w-full h-1 bg-[#252f42] accent-amber-400 rounded cursor-pointer"
                    title="Blacks"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Tăiere Albe/Negre</span>
                  <span>Podea Digitală</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* RUBRICA 3: SPLIT TONING & VIRAJ CROMATIC */}
      {/* ========================================================================= */}
      <div className="bg-[#151922] rounded-xl border border-[#232a38] overflow-hidden transition-all">
        {/* Accordion Header */}
        <button
          onClick={() => toggleRubric('rubric3')}
          className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-[#1a202c] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-mono font-bold text-xs flex items-center justify-center border border-purple-500/30">
              3
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Rubrica 3: Split Toning & Viraj Cromatic (Umbre & Lumini)
                </h4>
                <span className="bg-purple-500/10 text-purple-400 text-[10px] font-mono px-2 py-0.5 rounded border border-purple-500/20 font-semibold">
                  Teal / Orange & Film Tint
                </span>
              </div>
              {!openRubrics.rubric3 && (
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Shadow Tint: <span className="text-purple-300">{state.shadowTintStrength}%</span> | Highlight Tint: <span className="text-amber-300">{state.highlightTintStrength}%</span> | Crossover: <span className="text-indigo-300">{(state.splitBalance ?? 0) > 0 ? `+${state.splitBalance}` : (state.splitBalance ?? 0)} ({Math.round((0.5 + ((state.splitBalance ?? 0) / 100) * 0.3) * 100)} IRE)</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {openRubrics.rubric3 ? 'Restrânge' : 'Desfășoară'}
            </span>
            <div className={`p-1 rounded-md bg-[#1f2736] text-slate-300 transition-transform duration-200 ${openRubrics.rubric3 ? 'rotate-180 text-purple-400' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>

        {/* Accordion Body */}
        {openRubrics.rubric3 && (
          <div className="p-4 pt-2 border-t border-[#212735] space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shadow Tint */}
              <div className="space-y-2 bg-[#18202d] p-3.5 rounded-lg border border-[#263145]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">Tentă Umbre (Shadow Tint)</span>
                  <span className="font-mono text-purple-400 tabular-nums font-bold">
                    {state.shadowTintStrength}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={state.shadowTintStrength}
                  onChange={(e) => onChange({ shadowTintStrength: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-[#252f42] accent-purple-400 rounded cursor-pointer"
                />
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <span className="text-slate-400">Canal Umbre:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onChange({ shadowTint: { r: -0.05, g: 0.02, b: 0.08 } })}
                      className="px-2 py-0.5 bg-[#253043] hover:bg-[#313f57] text-slate-200 rounded font-mono text-[10px]"
                    >
                      Teal / Cyan
                    </button>
                    <button
                      onClick={() => onChange({ shadowTint: { r: 0.08, g: 0.04, b: -0.02 } })}
                      className="px-2 py-0.5 bg-[#253043] hover:bg-[#313f57] text-slate-200 rounded font-mono text-[10px]"
                    >
                      Sepia / Cald
                    </button>
                  </div>
                </div>
              </div>

              {/* Highlight Tint */}
              <div className="space-y-2 bg-[#18202d] p-3.5 rounded-lg border border-[#263145]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">Tentă Lumini (Highlight Tint)</span>
                  <span className="font-mono text-amber-400 tabular-nums font-bold">
                    {state.highlightTintStrength}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={state.highlightTintStrength}
                  onChange={(e) => onChange({ highlightTintStrength: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-[#252f42] accent-amber-400 rounded cursor-pointer"
                />
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <span className="text-slate-400">Canal Lumini:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onChange({ highlightTint: { r: 0.12, g: 0.08, b: -0.04 } })}
                      className="px-2 py-0.5 bg-[#253043] hover:bg-[#313f57] text-slate-200 rounded font-mono text-[10px]"
                    >
                      Auriu / Apus
                    </button>
                    <button
                      onClick={() => onChange({ highlightTint: { r: -0.04, g: 0.02, b: 0.06 } })}
                      className="px-2 py-0.5 bg-[#253043] hover:bg-[#313f57] text-slate-200 rounded font-mono text-[10px]"
                    >
                      Rece / Albastru
                    </button>
                  </div>
                </div>
              </div>

              {/* Crossover Point / Split Balance (Separare Tonală) */}
              <div className="md:col-span-2 space-y-3 bg-[#18202d] p-4 rounded-xl border border-[#2b374c]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232c3f] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                        Punct de Tranziție / Crossover Point (Split Balance)
                      </span>
                      <span className="font-mono text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/25">
                        Separare Tonală
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Controlează pragul exact de luminanță dintre umbrele și luminile virate cromatic.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">Prag Crossover:</span>
                    <span className="font-mono text-xs font-bold text-indigo-300 bg-[#121622] px-2.5 py-1 rounded border border-[#26334a] shadow-inner">
                      {(state.splitBalance ?? 0) > 0 ? `+${state.splitBalance}` : (state.splitBalance ?? 0)} ({Math.round((0.5 + ((state.splitBalance ?? 0) / 100) * 0.3) * 100)} IRE)
                    </span>
                  </div>
                </div>

                {/* Slider and Range Display */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-purple-300 font-semibold flex items-center gap-1">
                      ◀ Favorizează Umbrele (-100)
                    </span>
                    <span className="text-slate-300 font-mono text-[11px] hidden sm:inline">
                      {(state.splitBalance ?? 0) === 0
                        ? 'Centrat (50% IRE · Balans Standard DaVinci)'
                        : (state.splitBalance ?? 0) < 0
                        ? `Tranziție coborâtă la ${Math.round((0.5 + ((state.splitBalance ?? 0) / 100) * 0.3) * 100)} IRE (Tenta caldă coboară în tonuri medii)`
                        : `Tranziție ridicată la ${Math.round((0.5 + ((state.splitBalance ?? 0) / 100) * 0.3) * 100)} IRE (Tenta rece urcă în tonuri medii)`}
                    </span>
                    <span className="text-amber-300 font-semibold flex items-center gap-1">
                      Favorizează Luminile (+100) ▶
                    </span>
                  </div>

                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={state.splitBalance ?? 0}
                    onChange={(e) => onChange({ splitBalance: parseInt(e.target.value, 10) })}
                    className="w-full h-2 rounded cursor-pointer accent-indigo-400 bg-[#252f42]"
                  />

                  {/* Visual Crossover Indicator Bar */}
                  <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-purple-700 via-indigo-900/60 to-amber-500 border border-[#2c374d]">
                    {/* Glowing position marker */}
                    <div
                      className="absolute top-0 bottom-0 w-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.95)] -translate-x-1/2 transition-all duration-75"
                      style={{ left: `${(((state.splitBalance ?? 0) + 100) / 200) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                    <span>20 IRE (Umbre Adânci)</span>
                    <span>35 IRE</span>
                    <span className="text-slate-300 font-bold">50 IRE (Centru)</span>
                    <span>65 IRE</span>
                    <span>80 IRE (Lumini Înalte)</span>
                  </div>
                </div>

                {/* Quick Presets for Split Balance */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#20293a]">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                    <span>Preseturi Rapide:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => onChange({ splitBalance: -50 })}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                          (state.splitBalance ?? 0) === -50
                            ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                            : 'bg-[#222c3d] hover:bg-[#2c384e] text-slate-300'
                        }`}
                        title="Tranziție la 35 IRE: Tenta de lumini pătrunde generos în tonurile medii"
                      >
                        35 IRE (-50)
                      </button>
                      <button
                        onClick={() => onChange({ splitBalance: -25 })}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                          (state.splitBalance ?? 0) === -25
                            ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                            : 'bg-[#222c3d] hover:bg-[#2c384e] text-slate-300'
                        }`}
                      >
                        42 IRE (-25)
                      </button>
                      <button
                        onClick={() => onChange({ splitBalance: 0 })}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                          (state.splitBalance ?? 0) === 0
                            ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/50'
                            : 'bg-[#222c3d] hover:bg-[#2c384e] text-slate-300'
                        }`}
                        title="Tranziție centrată la 50 IRE"
                      >
                        50 IRE (Centrat 0)
                      </button>
                      <button
                        onClick={() => onChange({ splitBalance: 25 })}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                          (state.splitBalance ?? 0) === 25
                            ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50'
                            : 'bg-[#222c3d] hover:bg-[#2c384e] text-slate-300'
                        }`}
                      >
                        58 IRE (+25)
                      </button>
                      <button
                        onClick={() => onChange({ splitBalance: 50 })}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                          (state.splitBalance ?? 0) === 50
                            ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50'
                            : 'bg-[#222c3d] hover:bg-[#2c384e] text-slate-300'
                        }`}
                        title="Tranziție la 65 IRE: Tenta rece de umbre urcă spre tonurile medii"
                      >
                        65 IRE (+50)
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => onChange({ splitBalance: 0 })}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2.5 py-1 bg-[#1a212f] hover:bg-[#232d3f] rounded border border-[#273347] transition-colors"
                    title="Resetează punctul de tranziție la 0 (50 IRE)"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Reset Crossover</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* RUBRICA 4: SPAȚIU CROMATIC DE INTRARE & GAMUT ȚINTĂ */}
      {/* ========================================================================= */}
      <div className="bg-[#151922] rounded-xl border border-[#232a38] overflow-hidden transition-all">
        {/* Accordion Header */}
        <button
          onClick={() => toggleRubric('rubric4')}
          className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-[#1a202c] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center border border-emerald-500/30">
              4
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Rubrica 4: Spațiu Cromatic de Intrare (Camera Log) & Gamut Țintă (Gamma 2.4 / Rec.709-A)
                </h4>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                  Standard DaVinci Resolve
                </span>
              </div>
              {!openRubrics.rubric4 && (
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Input: <span className="text-emerald-300">{state.inputSpace}</span> | Target: <span className="text-amber-300">{state.targetColorSpace} Gamma {state.targetGamma}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {openRubrics.rubric4 ? 'Restrânge' : 'Desfășoară'}
            </span>
            <div className={`p-1 rounded-md bg-[#1f2736] text-slate-300 transition-transform duration-200 ${openRubrics.rubric4 ? 'rotate-180 text-emerald-400' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>

        {/* Accordion Body */}
        {openRubrics.rubric4 && (
          <div className="p-4 pt-2 border-t border-[#212735] space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Gamma & Standard */}
              <div className="bg-[#18202d] p-3.5 rounded-lg border border-[#263145] space-y-2">
                <span className="text-slate-200 font-semibold text-xs block">
                  Gamut & Standard de Ieșire DaVinci Resolve:
                </span>
                <select
                  value={`${state.targetColorSpace}_${state.targetGamma}`}
                  onChange={(e) => {
                    const [cs, g] = e.target.value.split('_');
                    onChange({
                      targetColorSpace: cs as any,
                      targetGamma: g as any,
                    });
                  }}
                  className="w-full bg-[#121622] border border-[#2c374b] text-xs text-white p-2 rounded-lg font-mono focus:outline-none"
                >
                  <option value="rec709_2.4">Rec.709 · Gamma 2.4 (BT.1886 Cinema/Mastering)</option>
                  <option value="rec709_2.2">Rec.709 · Gamma 2.2 (Web / Monitor sRGB)</option>
                  <option value="rec709_rec709a">Rec.709-A (Apple QuickTime Shift Fix)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Standardul recomandat de Blackmagic Design pentru mastering video de nuntă este Rec.709 Gamma 2.4.
                </p>
              </div>

              {/* Camera Input Space */}
              <div className="bg-[#18202d] p-3.5 rounded-lg border border-[#263145] space-y-2">
                <span className="text-slate-200 font-semibold text-xs block">
                  Spațiu Cromatic de Intrare (Profil Cameră):
                </span>
                <select
                  value={state.inputSpace}
                  onChange={(e) => onChange({ inputSpace: e.target.value as any })}
                  className="w-full bg-[#121622] border border-[#2c374b] text-xs text-amber-300 p-2 rounded-lg font-mono focus:outline-none"
                >
                  <option value="rec709">Rec.709 (Camere Standard / Mirrorless SDR)</option>
                  <option value="panasonic_gh5">Panasonic Lumix GH5 (V-Log L / Cine-D)</option>
                  <option value="panasonic_ux90">Panasonic AG-UX90 (4K Camcorder)</option>
                  <option value="sony_fx30">Sony FX30 (S-Log3 / S-Cinetone)</option>
                  <option value="canon_r6">Canon EOS R6 / R6 II (C-Log3)</option>
                  <option value="slog3">Sony S-Log3 General (A7IV, A7SIII, FX3)</option>
                  <option value="logc3">ARRI LogC3 Alexa Cinema</option>
                  <option value="bmdgen5">Blackmagic Film Gen 5 (Pocket 4K/6K)</option>
                  <option value="clog3">Canon C-Log3 Cinema</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Selectarea camerei corectează curba logaritmică și aliniază culorile senzorului la standardul Rec.709.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

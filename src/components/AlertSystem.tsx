import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoNotificationsOutline,
  IoCloseOutline,
  IoAddOutline,
  IoTrashOutline,
  IoAlertCircleOutline
} from 'react-icons/io5';
import { useAirQuality } from '../context/AirQualityContext';

interface AlertConfig {
  id: string;
  type: 'aqi' | 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co';
  threshold: number;
  active: boolean;
}

export default function AlertSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [userAlerts, setUserAlerts] = useState<AlertConfig[]>(() => {
    const savedAlerts = localStorage.getItem('airQualityAlerts');
    return savedAlerts ? JSON.parse(savedAlerts) : [
      { id: 'default-aqi', type: 'aqi', threshold: 150, active: true }
    ];
  });
  const [newAlertType, setNewAlertType] = useState<AlertConfig['type']>('aqi');
  const [newAlertThreshold, setNewAlertThreshold] = useState<number>(100);
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const { airQualityData } = useAirQuality();

  // Guardar alertas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('airQualityAlerts', JSON.stringify(userAlerts));
  }, [userAlerts]);

  // Verificar si hay alertas activas basadas en los datos actuales
  useEffect(() => {
    if (!airQualityData) return;

    const triggeredAlerts: string[] = [];

    userAlerts.forEach(alert => {
      if (!alert.active) return;

      let currentValue: number | undefined;

      switch (alert.type) {
        case 'aqi':
          currentValue = airQualityData.aqi;
          break;
        case 'pm25':
          currentValue = airQualityData.iaqi?.pm25?.v;
          break;
        case 'pm10':
          currentValue = airQualityData.iaqi?.pm10?.v;
          break;
        case 'o3':
          currentValue = airQualityData.iaqi?.o3?.v;
          break;
        case 'no2':
          currentValue = airQualityData.iaqi?.no2?.v;
          break;
        case 'so2':
          currentValue = airQualityData.iaqi?.so2?.v;
          break;
        case 'co':
          currentValue = airQualityData.iaqi?.co?.v;
          break;
      }

      if (currentValue !== undefined && currentValue >= alert.threshold) {
        triggeredAlerts.push(alert.id);
      }
    });

    setActiveAlerts(triggeredAlerts);
  }, [airQualityData, userAlerts]);

  // Añadir nueva alerta
  const addAlert = () => {
    const newAlert: AlertConfig = {
      id: `${newAlertType}-${Date.now()}`,
      type: newAlertType,
      threshold: newAlertThreshold,
      active: true
    };

    setUserAlerts(prev => [...prev, newAlert]);

    // Reset form
    setNewAlertType('aqi');
    setNewAlertThreshold(100);
  };

  // Eliminar alerta
  const removeAlert = (id: string) => {
    setUserAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Cambiar estado activo de alerta
  const toggleAlertActive = (id: string) => {
    setUserAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, active: !alert.active } : alert
      )
    );
  };

  // Traducir tipo de alerta
  const getAlertTypeName = (type: AlertConfig['type']) => {
    switch (type) {
      case 'aqi': return 'Índice de Calidad del Aire';
      case 'pm25': return 'PM2.5';
      case 'pm10': return 'PM10';
      case 'o3': return 'Ozono (O₃)';
      case 'no2': return 'Dióxido de Nitrógeno (NO₂)';
      case 'so2': return 'Dióxido de Azufre (SO₂)';
      case 'co': return 'Monóxido de Carbono (CO)';
    }
  };

  return (
    <>
      {/* Botón de alerta */}
      <div className="fixed left-4 bottom-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            activeAlerts.length > 0
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          aria-label="Sistema de alertas"
        >
          {isOpen ? (
            <IoCloseOutline className="w-6 h-6" />
          ) : (
            <IoNotificationsOutline className={`w-6 h-6 ${activeAlerts.length > 0 ? 'animate-pulse' : ''}`} />
          )}
          {activeAlerts.length > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full">
              {activeAlerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Panel de alertas */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed left-4 bottom-20 z-50 w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center">
              <IoNotificationsOutline className="mr-2" />
              Sistema de Alertas
            </h3>

            {/* Alertas activas */}
            {activeAlerts.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-300 flex items-center">
                  <IoAlertCircleOutline className="mr-1" /> Alertas activas
                </h4>
                <ul className="mt-2 space-y-2">
                  {activeAlerts.map(alertId => {
                    const alert = userAlerts.find(a => a.id === alertId);
                    if (!alert) return null;

                    return (
                      <li key={alert.id} className="text-sm text-red-700 dark:text-red-400">
                        {getAlertTypeName(alert.type)} supera el umbral de {alert.threshold}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Lista de alertas configuradas */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mis alertas configuradas
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {userAlerts.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No tienes alertas configuradas
                  </p>
                ) : (
                  userAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`flex items-center justify-between p-2 rounded-md border ${
                        activeAlerts.includes(alert.id)
                          ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10'
                          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={alert.active}
                          onChange={() => toggleAlertActive(alert.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {getAlertTypeName(alert.type)} ≥ {alert.threshold}
                        </span>
                      </div>
                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="text-gray-400 hover:text-red-500 focus:outline-none"
                        aria-label="Eliminar alerta"
                      >
                        <IoTrashOutline />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Formulario para añadir alerta */}
            <div className="mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Añadir nueva alerta
              </h4>

              <div className="flex gap-2 mb-2">
                <select
                  value={newAlertType}
                  onChange={(e) => setNewAlertType(e.target.value as AlertConfig['type'])}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                >
                  <option value="aqi">Índice de Calidad del Aire</option>
                  <option value="pm25">PM2.5</option>
                  <option value="pm10">PM10</option>
                  <option value="o3">Ozono (O₃)</option>
                  <option value="no2">Dióxido de Nitrógeno (NO₂)</option>
                  <option value="so2">Dióxido de Azufre (SO₂)</option>
                  <option value="co">Monóxido de Carbono (CO)</option>
                </select>

                <input
                  type="number"
                  value={newAlertThreshold}
                  onChange={(e) => setNewAlertThreshold(parseInt(e.target.value))}
                  min="0"
                  className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  placeholder="Valor"
                />
              </div>

              <button
                onClick={addAlert}
                className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm font-medium"
              >
                <IoAddOutline className="mr-1" /> Añadir alerta
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Recibirás alertas cuando los valores superen los umbrales configurados
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notificación emergente para alertas no vistas */}
      <AnimatePresence>
        {activeAlerts.length > 0 && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="fixed left-20 bottom-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            <div className="flex items-center">
              <IoAlertCircleOutline className="mr-2 text-xl" />
              <span>
                {activeAlerts.length === 1
                  ? '1 alerta activa'
                  : `${activeAlerts.length} alertas activas`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

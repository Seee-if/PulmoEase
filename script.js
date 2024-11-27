function MainComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [fenoValue, setFenoValue] = useState(30);
  const [heartRate, setHeartRate] = useState(75);
  const [spo2, setSpo2] = useState(98);
  const [themeColor, setThemeColor] = useState("#4a90e2");
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [contact, setContact] = useState("");
  const [emergencyClicked, setEmergencyClicked] = useState(false);
  const [audio, setAudio] = useState(null);
  const [showInhalerPopup, setShowInhalerPopup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showInhalerOverlay, setShowInhalerOverlay] = useState(false);
  const [prevStatus, setPrevStatus] = useState("Safe");
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [selectedAsthmaType, setSelectedAsthmaType] = useState(null);
  const [showSubTypes, setShowSubTypes] = useState(false);
  const [lastReadings, setLastReadings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMainType, setSelectedMainType] = useState(null);
  const [selectedSubType, setSelectedSubType] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    setIsFormValid(name.trim() !== "" && age !== "" && contact.length >= 10);
  }, [name, age, contact]);

  useEffect(() => {
    const status = getStatus();
    if (status === "Danger" && !timerActive) {
      setTimerActive(true);
      setTimeLeft(30);
      setShowInhalerPopup(true);
      setShowInhalerOverlay(true);
      navigator.vibrate && navigator.vibrate([200, 100, 200]);
      showNotificationWithMessage("Warning: High readings detected!");

      if (!audio) {
        const audioElement = new Audio(
          "https://drive.google.com/uc?export=download&id=14YnwTI0EYvaIYqabOKnDDIZ8izeyRCE3"
        );
        audioElement.loop = true;
        audioElement.play().catch(() => {});
        setAudio(audioElement);
      }
    } else if (status !== "Danger") {
      setTimerActive(false);
      setTimeLeft(30);
      setEmergencyClicked(false);
      setShowInhalerPopup(false);
      setShowInhalerOverlay(false);

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        setAudio(null);
      }
    }
  }, [fenoValue, heartRate, spo2]);

  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setEmergencyClicked(true);
            navigator.vibrate && navigator.vibrate([400, 100, 400]);
            showNotificationWithMessage("Emergency services contacted!");
            fetch("/api/add-ringing-voice", {
              method: "POST",
              body: JSON.stringify({ action: "last_one_yarb" }),
            });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerActive]);

  useEffect(() => {
    const newStatus = getStatus();
    if (newStatus !== prevStatus) {
      navigator.vibrate && navigator.vibrate(100);
      showNotificationWithMessage(`Status changed to ${newStatus}`);
      setLastReadings((prev) =>
        [
          ...prev,
          {
            timestamp: new Date().toLocaleString(),
            fenoValue,
            heartRate,
            spo2,
            status: newStatus,
          },
        ].slice(-10)
      );
    }
    setPrevStatus(newStatus);
  }, [fenoValue, heartRate, spo2]);

  const showNotificationWithMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };
  const handlePageTransition = () => {
    setIsPageTransitioning(true);
    setTimeout(() => {
      setCurrentPage(2);
      setIsPageTransitioning(false);
    }, 500);
  };
  const getStatus = () => {
    if (fenoValue > 50) return "Danger";
    if (fenoValue >= 25 && fenoValue <= 50 && (heartRate > 130 || spo2 < 92))
      return "Danger";
    if (fenoValue < 25 && (heartRate > 130 || spo2 < 92)) return "Mild";
    if (fenoValue <= 25) return "Safe";
    if (fenoValue <= 50) return "Mild";
    return "Danger";
  };
  const getStatusColor = () => {
    if (fenoValue <= 25) return "#22c55e";
    if (fenoValue <= 50) return "#eab308";
    return "#ef4444";
  };
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setFenoValue(value);
    if (value > 50) {
      navigator.vibrate && navigator.vibrate(200);
      showNotificationWithMessage("Warning: High FeNO level!");
    }
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (currentPage === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4a90e2] to-[#357abd] flex items-center justify-center p-4 transition-all duration-300">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl w-full max-w-2xl">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-[#4a90e2] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-lungs text-4xl text-white"></i>
            </div>
            <h1 className="text-4xl font-bold text-[#4a90e2] mb-2">
              PulmoEase
            </h1>
            <p className="text-gray-600">Track your respiratory health</p>
          </div>
          <div className="space-y-6 mb-8">
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-[#4a90e2] outline-none"
                name="name"
                required
                minLength={2}
              />
            </div>
            <div className="relative">
              <i className="fas fa-birthday-cake absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-[#4a90e2] outline-none"
                name="age"
                required
                min={1}
                max={120}
              />
            </div>
            <div className="relative">
              <i className="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="tel"
                placeholder="Emergency Contact"
                value={contact}
                onChange={(e) =>
                  setContact(e.target.value.replace(/[^0-9]/g, ""))
                }
                className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-[#4a90e2] outline-none"
                name="contactNumber"
                required
                pattern="[0-9]{10,}"
              />
            </div>
          </div>
          <button
            onClick={() => setCurrentPage(2)}
            disabled={!isFormValid}
            className={`w-full py-4 ${
              isFormValid
                ? "bg-[#4a90e2] hover:bg-[#357abd]"
                : "bg-gray-400 cursor-not-allowed"
            } text-white rounded-xl text-xl font-bold transition-colors`}
          >
            {isFormValid ? "Proceed to Monitoring" : "Please Fill All Fields"}
          </button>
        </div>
      </div>
    );
  }

  if (currentPage === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4a90e2] to-[#357abd] p-6">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mt-20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#4a90e2] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-lungs text-3xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold text-[#4a90e2] mb-2">
              Select Asthma Type
            </h2>
            <p className="text-gray-600">Choose your asthma condition</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={() => {
                setSelectedMainType("Severe Asthma");
                setCurrentPage(3);
              }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-xl text-white"></i>
              </div>
              <h3 className="text-lg font-bold text-center text-red-500 mb-2">
                Severe Asthma
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Persistent symptoms requiring intensive treatment
              </p>
            </div>
            <div
              onClick={() => {
                setSelectedMainType("Seasonal Asthma");
                setCurrentPage(3);
              }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-sun text-xl text-white"></i>
              </div>
              <h3 className="text-lg font-bold text-center text-yellow-500 mb-2">
                Seasonal Asthma
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Symptoms triggered by seasonal changes
              </p>
            </div>
            <div
              onClick={() => {
                setSelectedMainType("Exercise-Induced");
                setCurrentPage(3);
              }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-running text-xl text-white"></i>
              </div>
              <h3 className="text-lg font-bold text-center text-green-500 mb-2">
                Exercise-Induced
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Symptoms triggered by physical activity
              </p>
            </div>
            <div
              onClick={() => {
                setSelectedMainType("Occupational");
                setCurrentPage(3);
              }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-briefcase text-xl text-white"></i>
              </div>
              <h3 className="text-lg font-bold text-center text-blue-500 mb-2">
                Occupational
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Work-related triggers and exposures
              </p>
            </div>
            <div
              onClick={() => {
                setSelectedMainType("Allergic");
                setCurrentPage(3);
              }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-allergies text-xl text-white"></i>
              </div>
              <h3 className="text-lg font-bold text-center text-purple-500 mb-2">
                Allergic
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Allergy-triggered symptoms
              </p>
            </div>
            <div
              onClick={() => {
                setSelectedMainType("Other");
                setCurrentPage(3);
              }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-plus text-xl text-white"></i>
              </div>
              <h3 className="text-lg font-bold text-center text-gray-500 mb-2">
                Other Types
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Other asthma conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4a90e2] to-[#357abd] p-6">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mt-20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#4a90e2] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-lungs text-3xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold text-[#4a90e2] mb-2">
              Select Test Type
            </h2>
            <p className="text-gray-600">Choose your test option</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => {
                setSelectedOption("asthma");
                setCurrentPage(4);
              }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="w-16 h-16 bg-[#4a90e2] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-lungs text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-center text-[#4a90e2] mb-2">
                Asthma Monitoring
              </h3>
              <p className="text-gray-600 text-center">
                Monitor FeNO, heart rate, and SpO₂ levels
              </p>
            </div>
            <div
              onClick={() => {
                setSelectedOption("pneumonia");
                setCurrentPage(4);
              }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="w-16 h-16 bg-[#e24a4a] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-x-ray text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-center text-[#e24a4a] mb-2">
                Pneumonia Test
              </h3>
              <p className="text-gray-600 text-center">
                Upload chest X-ray for pneumonia detection
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 4) {
    if (selectedOption === "asthma") {
      return (
        <div
          className={`min-h-screen bg-gradient-to-br from-[#4a90e2] to-[#357abd] flex flex-col items-center justify-center p-4 relative transition-opacity duration-500 ${
            isPageTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {getStatus() === "Danger" && showInhalerOverlay && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 animate-slideUp">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                <i className="fas fa-pump-medical text-6xl text-[#4a90e2] mb-4"></i>
                <h2 className="text-2xl font-bold mb-4">
                  Use Your Inhaler Now!
                </h2>
                <p className="text-gray-600 mb-6">
                  Take two puffs of your rescue inhaler
                </p>
                <button
                  onClick={() => setShowInhalerOverlay(false)}
                  className="bg-[#4a90e2] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#357abd] transition-colors"
                >
                  I've Used My Inhaler
                </button>
              </div>
            </div>
          )}
          <div className="fixed top-0 left-0 right-0 bg-white/90 p-4 flex justify-between items-center shadow-lg z-[9999] animate-slideDown">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-[#4a90e2] w-8 h-8 flex flex-col justify-center items-center gap-1.5 transition-transform duration-300 hover:scale-110"
            >
              <span
                className={`w-6 h-0.5 bg-[#4a90e2] transition-all duration-300 ${
                  showMenu ? "rotate-45 translate-y-2" : ""
                }`}
              ></span>
              <span
                className={`w-6 h-0.5 bg-[#4a90e2] transition-all duration-300 ${
                  showMenu ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`w-6 h-0.5 bg-[#4a90e2] transition-all duration-300 ${
                  showMenu ? "-rotate-45 -translate-y-2" : ""
                }`}
              ></span>
            </button>
            {showMenu && (
              <div className="absolute top-full left-0 bg-white shadow-lg rounded-b-lg w-48 z-[9999]">
                <div
                  className="py-2 px-4 hover:bg-gray-100 cursor-pointer transition-colors duration-300"
                  onClick={() => setCurrentPage(6)}
                >
                  <i className="fas fa-user mr-2"></i>Account
                </div>
                <div
                  className="py-2 px-4 hover:bg-gray-100 cursor-pointer transition-colors duration-300"
                  onClick={() => setCurrentPage(5)}
                >
                  <i className="fas fa-history mr-2"></i>History
                </div>
              </div>
            )}
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl relative w-full max-w-3xl mt-20 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#4a90e2] p-2 rounded-full">
                      <i className="fas fa-wind text-lg text-white"></i>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#4a90e2]">
                        FeNO Level
                      </h2>
                      <p className="text-sm text-gray-600">{fenoValue} ppb</p>
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fenoValue}
                  onChange={handleSliderChange}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gray-200"
                  style={{
                    background: `linear-gradient(to right, #4a90e2 0%, #4a90e2 ${fenoValue}%, #e5e7eb ${fenoValue}%, #e5e7eb 100%)`,
                    transition: "background 0.3s ease",
                  }}
                />

                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>0 ppb</span>
                  <span>100 ppb</span>
                </div>
              </div>

              <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#e24a4a] p-2 rounded-full">
                      <i className="fas fa-heartbeat text-lg text-white animate-pulse"></i>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#e24a4a]">
                        Heart Rate
                      </h2>
                      <p className="text-sm text-gray-600">{heartRate} bpm</p>
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  min="40"
                  max="200"
                  value={heartRate}
                  onChange={(e) => setHeartRate(parseInt(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gray-200"
                  style={{
                    background: `linear-gradient(to right, #e24a4a 0%, #e24a4a ${
                      ((heartRate - 40) / 160) * 100
                    }%, #e5e7eb ${
                      ((heartRate - 40) / 160) * 100
                    }%, #e5e7eb 100%)`,
                    transition: "background 0.3s ease",
                  }}
                />

                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>40 bpm</span>
                  <span>200 bpm</span>
                </div>
              </div>

              <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#4ae24a] p-2 rounded-full">
                      <i className="fas fa-lungs text-lg text-white"></i>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#4ae24a]">SpO₂</h2>
                      <p className="text-sm text-gray-600">{spo2}%</p>
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  min="80"
                  max="100"
                  value={spo2}
                  onChange={(e) => setSpo2(parseInt(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gray-200"
                  style={{
                    background: `linear-gradient(to right, #4ae24a 0%, #4ae24a ${
                      ((spo2 - 80) / 20) * 100
                    }%, #e5e7eb ${((spo2 - 80) / 20) * 100}%, #e5e7eb 100%)`,
                    transition: "background 0.3s ease",
                  }}
                />

                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>80%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            <div
              className={`mt-6 p-2 rounded-xl transition-all duration-500 transform status-transition ${
                getStatus() === "Safe"
                  ? "bg-green-500"
                  : getStatus() === "Mild"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              } hover:scale-105`}
              style={{ width: "150px", margin: "0 auto" }}
            >
              <div className="text-center">
                <span className="text-xl font-bold text-white">
                  {getStatus()}
                </span>
              </div>
            </div>

            {getStatus() === "Danger" && (
              <div className="mt-6">
                <img
                  src="https://ucarecdn.com/315893c4-faa4-457f-9c90-42df90700794/-/format/auto/"
                  alt="Diaphragmatic breathing instructions showing person lying down with breathing technique"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}

            {getStatus() === "Danger" && !emergencyClicked && (
              <div className="text-center mt-8">
                <div className="text-4xl font-bold text-red-500 mb-6 animate-pulse">
                  {formatTime(timeLeft)}
                </div>
                <button
                  onClick={() => {
                    setEmergencyClicked(true);
                    fetch("/api/add-ringing-voice", {
                      method: "POST",
                      body: JSON.stringify({ action: "last_one_yarb" }),
                    });
                  }}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transform hover:scale-105"
                >
                  <i className="fas fa-phone-alt"></i>
                  <span>Call Emergency</span>
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  Emergency will be called if your FeNO% remains high
                </p>
              </div>
            )}

            {emergencyClicked && (
              <div className="text-center bg-green-100 p-6 rounded-2xl mt-6">
                <i className="fas fa-check-circle text-3xl text-green-500 mb-2"></i>
                <p className="text-green-700 font-bold">
                  Emergency services have been notified
                </p>
              </div>
            )}
          </div>
        </div>
      );
    } else if (selectedOption === "pneumonia") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#4a90e2] to-[#357abd] p-6">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mt-20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#e24a4a] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-x-ray text-3xl text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-[#e24a4a] mb-2">
                Pneumonia Detection
              </h2>
              <p className="text-gray-600">
                Upload a chest X-ray image for analysis
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Please add the "AI Image Analysis" integration from the "/" menu
                to enable this feature
              </p>
              <button
                onClick={() => setCurrentPage(3)}
                className="bg-[#4a90e2] text-white px-6 py-3 rounded-xl hover:bg-[#357abd] transition-all duration-300"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  if (currentPage === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4a90e2] to-[#357abd] p-6">
        <div className="fixed top-0 left-0 right-0 bg-white/90 p-4 flex justify-between items-center shadow-lg z-[9999] animate-slideDown">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-[#4a90e2] w-8 h-8 flex flex-col justify-center items-center gap-1.5 transition-transform duration-300 hover:scale-110"
          >
            <span
              className={`w-6 h-0.5 bg-[#4a90e2] transition-all duration-300 ${
                showMenu ? "rotate-45 translate-y-2" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-[#4a90e2] transition-all duration-300 ${
                showMenu ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-[#4a90e2] transition-all duration-300 ${
                showMenu ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></span>
          </button>
          {showMenu && (
            <div className="absolute top-full left-0 bg-white shadow-lg rounded-b-lg w-48 z-[9999]">
              <div
                className="py-2 px-4 hover:bg-gray-100 cursor-pointer transition-colors duration-300"
                onClick={() => setCurrentPage(4)}
              >
                <i className="fas fa-arrow-left mr-2"></i>Back to Monitor
              </div>
            </div>
          )}
        </div>
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mt-20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#4a90e2] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-history text-3xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold text-[#4a90e2] mb-2">
              Reading History
            </h2>
          </div>
          <div className="space-y-4">
            {lastReadings.map((reading, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl ${
                  reading.status === "Safe"
                    ? "bg-green-100"
                    : reading.status === "Mild"
                    ? "bg-yellow-100"
                    : "bg-red-100"
                } transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    {reading.timestamp}
                  </span>
                  <span
                    className={`font-bold px-3 py-1 rounded-full ${
                      reading.status === "Safe"
                        ? "bg-green-200 text-green-800"
                        : reading.status === "Mild"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {reading.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="text-sm text-gray-600">FeNO</div>
                    <div className="font-bold text-[#4a90e2]">
                      {reading.fenoValue} ppb
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="text-sm text-gray-600">Heart Rate</div>
                    <div className="font-bold text-[#e24a4a]">
                      {reading.heartRate} bpm
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="text-sm text-gray-600">SpO₂</div>
                    <div className="font-bold text-[#4ae24a]">
                      {reading.spo2}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 6) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4a90e2] to-[#357abd] p-6">
        <div className="fixed top-0 left-0 right-0 bg-white/90 p-4 flex justify-between items-center shadow-lg z-[9999] animate-slideDown">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-[#4a90e2] w-8 h-8 flex flex-col justify-center items-center gap-1.5 transition-transform duration-300 hover:scale-110"
          >
            <span
              className={`w-6 h-0.5 bg-[#4a90e2] transition-all duration-300 ${
                showMenu ? "rotate-45 translate-y-2" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-[#4a90e2] transition-all duration-300 ${
                showMenu ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-[#4a90e2] transition-all duration-300 ${
                showMenu ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></span>
          </button>
          {showMenu && (
            <div className="absolute top-full left-0 bg-white shadow-lg rounded-b-lg w-48 z-[9999]">
              <div
                className="py-2 px-4 hover:bg-gray-100 cursor-pointer transition-colors duration-300"
                onClick={() => setCurrentPage(4)}
              >
                <i className="fas fa-arrow-left mr-2"></i>Back to Monitor
              </div>
            </div>
          )}
        </div>
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mt-20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#4a90e2] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-user text-3xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold text-[#4a90e2] mb-2">
              Account Details
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-[#4a90e2] text-white px-4 py-2 rounded-lg hover:bg-[#357abd] transition-colors"
            >
              <i
                className={`fas ${isEditing ? "fa-times" : "fa-edit"} mr-2`}
              ></i>
              {isEditing ? "Cancel Edit" : "Edit Details"}
            </button>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-[#4a90e2] mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-600 block mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-[#4a90e2] outline-none"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-[#4a90e2] outline-none"
                    min="1"
                    max="120"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    value={contact}
                    onChange={(e) =>
                      setContact(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-[#4a90e2] outline-none"
                    pattern="[0-9]{10,}"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-[#4a90e2] mb-4">
                Asthma Information
              </h3>
              <div>
                <label className="text-gray-600 block mb-1">Asthma Type</label>
                {isEditing ? (
                  <div className="space-y-4">
                    <select
                      value={selectedMainType || ""}
                      onChange={(e) => {
                        const type = e.target.value;
                        setSelectedMainType(type);
                        if (type === "Severe Asthma") {
                          setShowSubTypes(true);
                        } else {
                          setSelectedAsthmaType(type);
                          setShowSubTypes(false);
                        }
                      }}
                      className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-[#4a90e2] outline-none"
                    >
                      <option value="">Select Type</option>
                      <option value="Severe Asthma">Severe Asthma</option>
                      <option value="Non-Allergic Asthma">
                        Non-Allergic Asthma
                      </option>
                      <option value="Thunderstorm Asthma">
                        Thunderstorm Asthma
                      </option>
                      <option value="Seasonal Asthma">Seasonal Asthma</option>
                      <option value="Occupational Asthma">
                        Occupational Asthma
                      </option>
                      <option value="Aspirin-Exacerbated Asthma">
                        Aspirin-Exacerbated Asthma
                      </option>
                      <option value="Exercise-Induced Asthma">
                        Exercise-Induced Asthma
                      </option>
                      <option value="Childhood Asthma">Childhood Asthma</option>
                      <option value="Adult-Onset Asthma">
                        Adult-Onset Asthma
                      </option>
                      <option value="Eosinophilic Asthma">
                        Eosinophilic Asthma
                      </option>
                      <option value="Cough-Variant Asthma">
                        Cough-Variant Asthma
                      </option>
                      <option value="Nighttime Asthma">Nighttime Asthma</option>
                    </select>
                    {showSubTypes && selectedMainType === "Severe Asthma" && (
                      <select
                        value={selectedSubType || ""}
                        onChange={(e) => {
                          const subtype = e.target.value;
                          setSelectedSubType(subtype);
                          setSelectedAsthmaType(subtype);
                        }}
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-[#4a90e2] outline-none"
                      >
                        <option value="">Select Subtype</option>
                        <option value="Allergic Asthma">Allergic Asthma</option>
                        <option value="Eosinophilic Asthma">
                          Eosinophilic Asthma
                        </option>
                        <option value="Non-Eosinophilic Asthma">
                          Non-Eosinophilic Asthma
                        </option>
                      </select>
                    )}
                  </div>
                ) : (
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {selectedAsthmaType || "Not specified"}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-[#4a90e2] mb-4">
                Latest Readings
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-gray-600 mb-1">FeNO Level</div>
                  <div className="text-xl font-bold text-[#4a90e2]">
                    {fenoValue} ppb
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 mb-1">Heart Rate</div>
                  <div className="text-xl font-bold text-[#e24a4a]">
                    {heartRate} bpm
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 mb-1">SpO₂</div>
                  <div className="text-xl font-bold text-[#4ae24a]">
                    {spo2}%
                  </div>
                </div>
              </div>
            </div>
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentPage(4);
                }}
                className="w-full py-3 bg-[#4a90e2] hover:bg-[#357abd] text-white rounded-xl font-bold transition-colors"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

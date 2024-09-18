import React, { createContext, useContext, useState } from 'react';

const GlobalContext = createContext(); // ตัวแผ่นกระดาษ Center

export const GlobalProvider = ({ children }) => { // ตัวเชื่อมการ Access กระดาษ
	const [globalParams, setGlobalParams] = useState({});

	return (
		<GlobalContext.Provider value={{ globalParams, setGlobalParams }}>
			{children}
		</GlobalContext.Provider>
	);
};

export const useGlobalContext = () => useContext(GlobalContext);

// Before Usage
// -- In Main Navigator page -- Top
// import { GlobalProvider } from '../context/GlobalContext';  // Context

// -- In Main Navigator page -- ครอบตัวอื่นๆ ไว้ด้วย
// export default function AppNavigator() {
//	return (
//			<GlobalProvider></GlobalProvider>

//  		</GlobalProvider>
//	);
//}

// =====================================================================

// Usage in each screen

// -- On Top -- 
// import { useGlobalContext } from '../context/GlobalContext';

// -- In Page Function --
// const { globalParams, setGlobalParams } = useGlobalContext();

// -- When really use --
// setGlobalParams(prev => ({ ...prev, mykey: myvale, myotherkey : myothervalue }));
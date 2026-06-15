import React, { createContext, useState, useEffect, useContext } from 'react';
import { getData, saveData, STORAGE_KEYS } from '../utils/storage';

const AccountsContext = createContext();

export const AccountsProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [currentlySelectedAccount, setCurrentlySelectedAccount] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load accounts on startup
  useEffect(() => {
    const loadData = async () => {
      const savedAccounts = await getData(STORAGE_KEYS.ACCOUNTS);
      const selectedAccount = await getData(STORAGE_KEYS.SELECTED_ACCOUNT);
      
      if (savedAccounts) setAccounts(savedAccounts);
      if (selectedAccount) setCurrentlySelectedAccount(selectedAccount);
      
      setIsInitializing(false);
    };
    loadData();
  }, []);

  const addAccount = async (accountNumber, name) => {
    if (accountNumber.length !== 13 || accounts.some(acc => acc.accountNumber === accountNumber)) {
      return false; 
    }
    
    const newAccount = { accountNumber, name };
    const updatedAccounts = [...accounts, newAccount];
    
    setAccounts(updatedAccounts);
    await saveData(STORAGE_KEYS.ACCOUNTS, updatedAccounts);

    // Auto-select if it's the first account
    if (!currentlySelectedAccount) {
      setCurrentlySelectedAccount(newAccount);
      await saveData(STORAGE_KEYS.SELECTED_ACCOUNT, newAccount);
    }
    return true;
  };

  const deleteAccount = async (accountNumber) => {
    const updatedAccounts = accounts.filter(acc => acc.accountNumber !== accountNumber);
    setAccounts(updatedAccounts);
    await saveData(STORAGE_KEYS.ACCOUNTS, updatedAccounts);

    // If we deleted the currently selected account, select the next available one or null
    if (currentlySelectedAccount?.accountNumber === accountNumber) {
      const nextSelected = updatedAccounts.length > 0 ? updatedAccounts[0] : null;
      setCurrentlySelectedAccount(nextSelected);
      await saveData(STORAGE_KEYS.SELECTED_ACCOUNT, nextSelected);
    }
  };

  const handleSetSelectedAccount = async (account) => {
    setCurrentlySelectedAccount(account);
    await saveData(STORAGE_KEYS.SELECTED_ACCOUNT, account);
  };

  return (
    <AccountsContext.Provider value={{ 
      accounts, 
      currentlySelectedAccount, 
      addAccount, 
      deleteAccount, 
      setCurrentlySelectedAccount: handleSetSelectedAccount,
      isInitializing
    }}>
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccounts = () => useContext(AccountsContext);
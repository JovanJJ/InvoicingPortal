
'use client';

import { useState } from 'react';
import ProfileUpload from '@/components/ProfileUpload';
import { updateUserSettings, addBankAccount, deleteBankAccount, pickDefaultBankAccount } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import Loading from "@/app/loading";

export default function SettingsForm({ user, currencies }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        defaultCurrency: user?.defaultCurrency || "",
        notification: user?.notifications,
        address: user?.address || "",
    });

    const [bankData, setBankData] = useState({
        bankName: "",
        iban: "",
        currency: "USD",
        accountOwnerFirstName: "",
        accountOwnerLastName: ""
    });
    const [enabled, setEnabled] = useState(user?.notifications || false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });


    const [settingsData, setSettingsData] = useState({
        defaultCurrency: user?.defaultCurrency || "USD",
        notification: user?.notifications || false,
        address: user?.address || "",
        taxIdType: user?.taxIdType || "",
        taxIdNumber: user?.taxIdNumber || "",
    });

    const handlePickDefault = async (userId, bankId) => {
        setLoading(true);
        const res = await pickDefaultBankAccount(userId, bankId);
        if (res.success) {
            setMessage({ type: 'success', text: res.message });
            router.refresh();
        } else {
            setMessage({ type: 'error', text: res.message });
        }
        setLoading(false);
    }

    const handleDeleteBank = async (userId, bankId) => {
        setLoading(true);
        const res = await deleteBankAccount(userId, bankId);
        if (res.success) {
            setMessage({ type: 'success', text: res.message });
            router.refresh();
        } else {
            setMessage({ type: 'error', text: res.message });
        }
        setLoading(false);
    }

    const handleBankData = (e) => {
        setBankData({
            ...bankData,
            [e.target.name]: e.target.value
        })
    }

    const handleSettingsChange = (e) => {
        setSettingsData({
            ...settingsData,
            [e.target.name]: e.target.value
        })
    }

    const handleAddBank = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await addBankAccount(user._id, bankData);
        if (res.success) {
            setMessage({ type: 'success', text: res.message });
            setBankData({ bankName: "", iban: "", currency: "USD", accountOwnerFirstName: "", accountOwnerLastName: "" });
            router.refresh();
        } else {
            setMessage({ type: 'error', text: res.message });
        }
        setLoading(false);
    }

    const handleSaveSettings = async () => {
        setLoading(true);
        const res = await updateUserSettings(user._id.toString(), settingsData);
        if (res.success) {
            setMessage({ type: 'success', text: res.message });
            router.refresh();
        } else {
            setMessage({ type: 'error', text: res.message });
        }
        setLoading(false);
    }



    return (
        loading ? (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <Loading />
            </div>)
            : (
                <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-xl border border-gray-100 mt-10">
                    <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">Settings</h1>


                    <div className="mb-10 flex flex-col items-center">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Profile Picture</h2>
                        <ProfileUpload currentImage={user.logo} />
                    </div>

                    <div className='flex flex-col'>
                        <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2'>Bank accounts</h2>

                        {user.bankAccounts.map((acc, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-7 items-center border border-gray-200 p-2 rounded-lg mt-2 text-sm gap-2 bg-gray-50/50">
                                <div className="px-2 font-bold text-gray-400">#{i + 1}</div>

                                <div className="md:border-r border-gray-200 px-3 overflow-hidden">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase md:hidden block mb-1">Bank Name</span>
                                    <div className="font-medium text-gray-800 truncate">{acc.bankName}</div>
                                </div>

                                <div className="md:border-r border-gray-200 px-3">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase md:hidden block mb-1">IBAN</span>
                                    <div className="font-mono text-gray-600 break-all">{acc.iban}</div>
                                </div>

                                <div className="md:border-r border-gray-200 px-3 overflow-hidden">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase md:hidden block mb-1">Owner</span>
                                    <div className="font-medium text-gray-800 truncate">
                                        {acc.accountOwnerFirstName} {acc.accountOwnerLastName}
                                    </div>
                                </div>

                                <div className="md:border-r border-gray-200 px-3 text-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase md:hidden block mb-1">Status</span>
                                    {acc.isDefault ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                                            Default
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                            Secondary
                                        </span>
                                    )}
                                </div>

                                <div className="md:border-r border-gray-200 px-3 text-center">
                                    {!acc.isDefault ? (
                                        <button
                                            onClick={() => handlePickDefault(user._id, acc.id)}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                                            disabled={loading}
                                        >
                                            Set as default
                                        </button>
                                    ) : (
                                        <span className="text-gray-300 text-xs">---</span>
                                    )}
                                </div>

                                <div className="px-3 text-center">
                                    <button
                                        onClick={() => handleDeleteBank(user._id, acc.id)}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline transition-colors"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>

                    <div className="space-y-8 mt-5">
                        <div className="space-y-4">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">Add bank</h2>
                            <form onSubmit={handleAddBank} className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner First Name</label>
                                        <input
                                            name="accountOwnerFirstName"
                                            value={bankData.accountOwnerFirstName}
                                            onChange={handleBankData}
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner Last Name</label>
                                        <input
                                            name="accountOwnerLastName"
                                            value={bankData.accountOwnerLastName}
                                            onChange={handleBankData}
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                        <input
                                            name="bankName"
                                            value={bankData.bankName}
                                            onChange={handleBankData}
                                            type="text"
                                            placeholder="e.g. Raiffeisen Bank"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                                        <input
                                            onChange={handleBankData}
                                            value={bankData.iban}
                                            name='iban'
                                            id="iban"
                                            type="text"
                                            placeholder="RS35..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className='block text-sm font-medium text-gray-700 mb-1'>Currency</div>
                                    <select
                                        onChange={handleBankData}
                                        name='currency'
                                        value={bankData.currency}
                                        className='border border-gray-300 p-2 rounded w-full'
                                    >
                                        <option value="">Select currency</option>
                                        {currencies.map((currency) => (
                                            <option key={currency.id} value={currency.name}>{currency.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`cursor-pointer w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${loading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 active:scale-[0.98]'
                                            }`}
                                    >
                                        {loading ? 'Saving...' : 'Add ✓'}
                                    </button>
                                </div>
                            </form>
                        </div>







                        {message.text && (
                            <p className={`text-center text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message.text}
                            </p>
                        )}
                    </div>

                    <div className='flex flex-col'>
                        <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2 mt-5'>Currency settings</h2>
                        <div>Pick default currency:</div>
                        <select
                            name="defaultCurrency"
                            value={settingsData.defaultCurrency}
                            onChange={handleSettingsChange}
                            className='border border-gray-300 p-2 rounded max-w-[100px]'
                        >
                            {currencies.map((currency) => (
                                <option key={currency.id} value={currency.name}>{currency.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleSaveSettings}
                            disabled={loading}
                            className='bg-green-500 text-white font-semibold w-fit px-3 py-1 rounded mt-2 disabled:bg-green-300'
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                    <div className='flex flex-col mt-5 w-full'>
                        <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2 mt-5'>Address</h2>
                        <span>Address will be displayed on invoices</span>
                        <input
                            type="text"
                            name="address"
                            value={settingsData.address}
                            onChange={handleSettingsChange}
                            className='border border-gray-300 p-2 rounded w-full'
                        />
                        <button
                            onClick={handleSaveSettings}
                            disabled={loading}
                            className='bg-green-500 text-white font-semibold w-fit px-3 py-1 rounded mt-2 disabled:bg-green-300'
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                    <div className='flex flex-col mt-5 w-full'>
                        <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2 mt-5'>Tax ID</h2>
                        <span>Tax ID will be displayed on invoices</span>
                        <div className='flex items-center gap-2'>
                            <select name="taxIdType" value={settingsData.taxIdType} onChange={handleSettingsChange}>
                                <option value="">Select tax type</option>
                                <option value="EIN">EIN</option>
                                <option value="VAT">VAT</option>
                                <option value="PIB">PIB</option>
                            </select>
                            <input
                                type="text"
                                name="taxIdNumber"
                                value={settingsData.taxIdNumber}
                                onChange={handleSettingsChange}
                                className='border border-gray-300 p-2 rounded w-full'
                                placeholder='ID numbers only'
                            />
                        </div>
                        <button
                            onClick={handleSaveSettings}
                            disabled={loading}
                            className='bg-green-500 text-white font-semibold w-fit px-3 py-1 rounded mt-2 disabled:bg-green-300'
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                    <div className="flex items-center mt-5 justify-between  bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <h3 className="font-medium text-gray-800">Email Notifications</h3>
                            <p className="text-sm text-gray-500">Receive updates about your invoices and projects.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const newEnabled = !enabled;
                                setEnabled(newEnabled);
                                setSettingsData({ ...settingsData, notification: newEnabled });
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none 
        ${enabled ? "bg-green-500" : "bg-gray-300"}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform 
          ${enabled ? "translate-x-6" : "translate-x-1"}`}
                            />
                        </button>
                    </div>
                </div>
            )
    );
}

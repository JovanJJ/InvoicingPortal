import SettingsForm from "./SettingsForm";
import getSession from "@/lib/auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { fetchUser, fetchCurrencies } from "@/lib/actions";

export const metadata = {
    title: "Settings",
    description: "Manage your account and preferences.",
};

export default async function SettingPage() {
    const session = await getSession(authOptions);
    const id = session.user.id;
    const userData = await fetchUser(id);
    const currencies = await fetchCurrencies();

    if (!userData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500 font-medium text-lg">User not found</p>
            </div>
        );
    }

    const user = {
        _id: userData._id.toString(),
        name: userData.name || "",
        email: userData.email || "",
        logo: userData.logo || null,
        notifications: userData.notifications ?? true,

        bankAccounts: (userData.bankAccounts || []).map(acc => ({
            bankName: acc.bankName || "",
            iban: acc.iban || "",
            label: acc.label || "",
            isDefault: acc.isDefault || false,
            currency: acc.currency || "",
            id: acc._id.toString(),
        })),
        address: userData.address || "",
        taxIdType: userData.taxIdType || "",
        taxIdNumber: userData.taxIdNumber || "",
        defaultCurrency: userData.defaultCurrency || "USD"
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <SettingsForm user={user} currencies={currencies} />
        </div>
    );
}

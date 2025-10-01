import UpdatePasswordForm from "@/components/dashboard/UpdatePasswordForm";
import UpdateProfileForm from "@/components/dashboard/UpdateProfileForm";

export default function ProfilePage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona la información de tu cuenta.</p>
      </div>
      <div className="grid gap-6">
        <UpdateProfileForm />
        <UpdatePasswordForm />
      </div>
    </>
  );
}
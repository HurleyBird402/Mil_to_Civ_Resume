"use client";
import GlossaryAdminForm from "@/components/GlossaryAdminForm";

export default function AdminPage() {
  // We no longer need to pass a password here!
  // The Middleware has already vetted the user.
  
  return (
    <div className="min-h-screen bg-black text-white p-12 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-omega-gold mb-8">COMMAND CENTER</h1>
      <div className="w-full max-w-md">
        <GlossaryAdminForm 
            // We can rely on the API route to check the server-side secret now,
            // or simply pass the same secret if your API still requires it.
            // For now, let's keep the prop to prevent errors, but know it's safer.
            adminPassword="objective-omega-secret" 
            onSaved={() => alert("Term secured in database.")} 
        />
      </div>
    </div>
  );
}
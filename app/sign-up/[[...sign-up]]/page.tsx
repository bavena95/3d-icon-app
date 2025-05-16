import { SignUp } from "@clerk/nextjs"

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">icon3d.ai</h1>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <a href="/sign-in" className="font-medium text-black hover:text-gray-800">
              sign in to an existing account
            </a>
          </p>
        </div>
        <div className="mt-8">
          <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
        </div>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">icon3d.ai</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-center text-2xl">Check your email</CardTitle>
            <CardDescription className="text-center">
              We've sent you a verification link. Please check your email to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-500">
            <p>
              If you don't see the email, check your spam folder. If you still don't see it, try requesting a new
              verification link.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
              <Link href="/auth/login">Return to login</Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-black">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

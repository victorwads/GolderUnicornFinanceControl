//
//  LoginScreen.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 09/01/24.
//

import SwiftUI
import _AuthenticationServices_SwiftUI

struct LoginScreen: View {
    
    let authManager: AuthenticationManager

    var body: some View {
        VStack {
            SignInWithAppleButton(.signIn) { request in
                request.nonce = authManager.getShaNonce()
                request.requestedScopes = [.fullName, .email]
            } onCompletion: { result in
                switch result {
                case let .success(authResults):
                    authManager.continueFirebaseLogin(authResults)
                    print("Authorisation successful")
                case let .failure(error):
                    authManager.updateUser()
                    print("Authorisation failed: \(error.localizedDescription)")
                }
            }
            .signInWithAppleButtonStyle(.whiteOutline)
            .frame(height: 45)
            Button("Sign In With Google") {
                authManager.googleLogin()
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity)
            .cornerRadius(5)
        }.padding()
    }
}

#Preview {
    LoginScreen(authManager: AuthenticationManager())
}

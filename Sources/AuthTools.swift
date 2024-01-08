//
//  AuthTools.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 08/01/24.
//

import AuthenticationServices
import CryptoKit
import FirebaseAuth
import FirebaseCore
import Foundation
import GoogleSignIn

class AuthenticationManager: ObservableObject {
  private let auth = Auth.auth()
  private var currentNonce: String?

  @Published var userInfo: String?

  init() {
    setupAuthenticationListener()
  }

  private func setupAuthenticationListener() {
    auth.addStateDidChangeListener { _, user in
      self.updateUser(user)
    }
  }

  private func randomNonceString(length: Int = 32) -> String {
    precondition(length > 0)
    var randomBytes = [UInt8](repeating: 0, count: length)
    let errorCode = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
    if errorCode != errSecSuccess {
      fatalError(
        "Unable to generate nonce. SecRandomCopyBytes failed with OSStatus \(errorCode)"
      )
    }

    let charset: [Character] =
      Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")

    let nonce = randomBytes.map { byte in
      // Pick a random character from the set, wrapping around if needed.
      charset[Int(byte) % charset.count]
    }

    return String(nonce)
  }

  @available(iOS 13, *)
  private func sha256(_ input: String) -> String {
    let inputData = Data(input.utf8)
    let hashedData = SHA256.hash(data: inputData)
    let hashString = hashedData.compactMap {
      String(format: "%02x", $0)
    }.joined()

    return hashString
  }

  func getShaNonce() -> String {
    let nonce = randomNonceString()
    currentNonce = nonce
    return sha256(nonce)
  }

  func updateUser(_ user: FirebaseAuth.User? = nil) {
    let user = user ?? auth.currentUser
    guard let safeUser = user else {
      userInfo = nil
      return
    }
    userInfo = "\(safeUser.displayName ?? "") - \(safeUser.email ?? "")"
  }

  func continueFirebaseLogin(_ authorization: ASAuthorization) {
    guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential else {
      fatalError("autorizartion result error")
    }
    guard let appleIDToken = appleIDCredential.identityToken else {
      print("Unable to fetch identity token")
      return
    }
    guard let idTokenString = String(data: appleIDToken, encoding: .utf8) else {
      print("Unable to serialize token string from data: \(appleIDToken.debugDescription)")
      return
    }
    let credential = OAuthProvider.appleCredential(withIDToken: idTokenString,
                                                   rawNonce: currentNonce,
                                                   fullName: appleIDCredential.fullName)
    // Sign in with Firebase.
    auth.signIn(with: credential) { _, error in
      if error != nil {
        // Error. If error.code == .MissingOrInvalidNonce, make sure
        // you're sending the SHA256-hashed nonce as a hex string with
        // your request to Apple.
        print(error?.localizedDescription ?? "")
        return
      }
      self.updateUser()
    }
  }

  func googleLogin() {
    guard let clientID = FirebaseApp.app()?.options.clientID else { return }
    guard let viewController = UIApplication.shared.windows.first?.rootViewController else { return }

    // Create Google Sign In configuration object.
    let config = GIDConfiguration(clientID: clientID)
    GIDSignIn.sharedInstance.configuration = config

    // Start the sign in flow!
    GIDSignIn.sharedInstance.signIn(withPresenting: viewController) { result, error in
      guard error == nil else {
        return
      }

      guard let user = result?.user,
            let idToken = user.idToken?.tokenString
      else {
        return
      }

      let credential = GoogleAuthProvider.credential(withIDToken: idToken,
                                                     accessToken: user.accessToken.tokenString)

      self.auth.signIn(with: credential) { _, _ in
        //
      }
    }
  }

  func logOut() {
    do {
      try auth.signOut()
    } catch let signOutError as NSError {
      print("Error signing out: %@", signOutError)
    }
    userInfo = nil
  }
}

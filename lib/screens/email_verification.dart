import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gem2/screens/catalouge_screen.dart';
import 'package:pinput/pinput.dart';

class EmailVerification extends StatefulWidget {
  final String email;

  const EmailVerification({
    super.key,
    required this.email,
  });

  @override
  State<EmailVerification> createState() => _EmailVerificationState();
}

class _EmailVerificationState extends State<EmailVerification> {
  bool _isLoading = false;
  String? _errorText;
  int? _otp;
  final _otpController = TextEditingController();
  Timer? _timer;
  int _timeLeft = 60;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _sendOTP();
  }

  void _startTimer() {
    setState(() {
      _timeLeft = 60;
      _canResend = false;
    });

    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_timeLeft > 0) {
          _timeLeft--;
        } else {
          _canResend = true;
          timer.cancel();
        }
      });
    });
  }

  Future<void> _sendOTP() async {
    setState(() {
      _isLoading = true;
      _errorText = null;
    });

    // Simulate API call delay
    await Future.delayed(const Duration(seconds: 1));

    try {
      // For testing purposes, use hardcoded OTP '000000'
      _otp = 0; // OTP is 000000 (which equals 0)
      _startTimer();
      setState(() {
        _errorText = null; // Clear any previous errors
      });
    } catch (e) {
      setState(() {
        _errorText = 'Failed to send OTP. Please try again.';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _verifyOTP() {
    final enteredOTPText = _otpController.text.replaceAll(' ', ''); // Remove any spaces
    final enteredOTP = int.tryParse(enteredOTPText);

    // For testing purposes, accept '000000' or any 6-digit input
    if (enteredOTPText == '000000' || (enteredOTP != null && enteredOTPText.length == 6)) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (context) => const CatalogueScreen(),
        ),
        (route) => false,
      );
    } else {
      setState(() {
        _errorText = 'Invalid OTP. Please try again.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Email Verification'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Header section
            Text(
              'Enter the OTP sent to\n${widget.email}',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.yellow.shade100,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.yellow.shade300),
              ),
              child: const Text(
                'For Testing Purpose: OTP is 000000',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Colors.black87,
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Timer display
            Text(
              'Time remaining: ${(_timeLeft ~/ 60).toString().padLeft(2, '0')}:${(_timeLeft % 60).toString().padLeft(2, '0')}',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 32),
            
            // OTP input field
            Pinput(
              controller: _otpController,
              length: 6,
              defaultPinTheme: PinTheme(
                width: 56,
                height: 56,
                textStyle: const TextStyle(
                  fontSize: 20,
                  color: Colors.black,
                  fontWeight: FontWeight.w600,
                ),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              focusedPinTheme: PinTheme(
                width: 56,
                height: 56,
                textStyle: const TextStyle(
                  fontSize: 20,
                  color: Colors.black,
                  fontWeight: FontWeight.w600,
                ),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.black),
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
            if (_errorText != null)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Text(
                  _errorText!,
                  style: const TextStyle(color: Colors.red),
                ),
              ),
              
            // Spacer to push buttons to bottom
            const Spacer(),
            
            // Bottom buttons section
            Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _verifyOTP,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                    ),
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('VERIFY', style: TextStyle(fontSize: 16)),
                  ),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: (_isLoading || !_canResend) ? null : _sendOTP,
                  child: Text(
                    _canResend ? 'Resend OTP' : 'Please wait till timer ends...',
                    style: TextStyle(
                      color: (_isLoading || !_canResend) ? Colors.grey : Colors.black,
                    ),
                  ),
                ),
                const SizedBox(height: 16), // Bottom padding
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _otpController.dispose();
    _timer?.cancel();
    super.dispose();
  }
}

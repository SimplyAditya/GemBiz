// ignore_for_file: avoid_print, use_build_context_synchronously

import 'dart:io';
import 'dart:ui';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gem2/screens/email_verification.dart';
import 'package:gem2/screens/gst_entry_screen.dart';
import 'package:latlong2/latlong.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

import 'store_timing_screen.dart';
import 'package:provider/provider.dart';
import 'package:gem2/providers/store_data_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:gem2/providers/location_provider.dart';
import 'package:gem2/screens/openstreetmap_screen.dart';
import 'package:gem2/screens/catalouge_screen.dart'; // Add this import
import 'package:gem2/providers/auth_provider.dart' as auth_provider;
import 'package:gem2/widgets/snackbar.dart';
import 'package:gem2/services/graphql_service.dart';

class CreateBusinessAccountScreen extends StatefulWidget {
  final String? docId;
  const CreateBusinessAccountScreen({super.key, this.docId});

  @override
  // ignore: library_private_types_in_public_api
  _CreateBusinessAccountScreenState createState() =>
      _CreateBusinessAccountScreenState();
}

class _CreateBusinessAccountScreenState
    extends State<CreateBusinessAccountScreen> {
  final _formKey = GlobalKey<FormState>();
  String _businessRole = 'owner';
  String _gstNumber = '';
  String? _gstFilePath;
  String? _gstFileType;
  String _storeTimings = '';
  String? _attachedImagePath;
  bool _isLoading = false;
  String? _existingLogoUrl; // Add this variable to store existing logo URL
// Add this for GST file URL
  final TextEditingController _businessNameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController userNameController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController mobileController = TextEditingController();
  final TextEditingController websiteController = TextEditingController();
  final TextEditingController _gstController = TextEditingController();
  final TextEditingController _displayWebsiteController =
      TextEditingController();
  String _actualWebsiteValue = '';
  String? _userEmail; // Add this variable to store the email

  @override
  void initState() {
    super.initState();
    if (widget.docId != null) {
      _loadExistingData();
    }
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final prefs = await SharedPreferences.getInstance();
      setState(() {
        _userEmail = prefs.getString('user_email');
      });
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final storeDataProvider =
          Provider.of<StoreDataProvider>(context, listen: false);
      setState(() {
        _storeTimings = storeDataProvider.getFormattedStoreTimes();
      });
    });
    websiteController.addListener(() {
      if (websiteController.text.isNotEmpty) {
        _displayWebsiteController.text =
            websiteController.text.replaceAll(RegExp(r'https?://'), '');
      }
    });
  }

  String? _validateWebsite(String? value) {
    if (value == null || value.isEmpty) {
      return null; // Website is optional
    }

    // Basic URL pattern without requiring http/https prefix
    final urlPattern = RegExp(
      r'^[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$',
      caseSensitive: false,
    );

    if (!urlPattern.hasMatch(value)) {
      return 'Please enter a valid website URL';
      //showTopSnackBar(context, 'Please enter a valid website URL');
      //testreturn ' ';
    }

    return null;
  }

  Future<void> _loadExistingData() async {
    if (widget.docId == null) return;

    final prefs = await SharedPreferences.getInstance();
    final uid = prefs.getString('user_uid');
    if (uid == null) return;

    final client = GraphQLService.initClient().value;

    const String getBusinessQuery = r'''
      query GetBusiness($uid: String!) {
        getBusiness(uid: $uid) {
          id
          storeverified
          category
          name
          description
          email
          website
          gst {
            id
            gst_file_url
            gst_file_type
            gst_no
          }
          logo_image_url
          mobile
          address
          user_type
          user_name
          uid
        }
      }
    ''';

    try {
      final QueryResult result = await client.query(QueryOptions(
        document: gql(getBusinessQuery),
        variables: {'uid': uid},
        fetchPolicy: FetchPolicy.networkOnly,
      ));

      if (result.hasException) {
        print('Error fetching business data: ${result.exception.toString()}');
        return;
      }

      final businessData = result.data?['getBusiness'];
      if (businessData != null) {
        setState(() {
          // Populate form fields with existing data
          _businessNameController.text = businessData['name'] ?? '';
          _descriptionController.text = businessData['description'] ?? '';
          _userEmail = businessData['email'];
          websiteController.text = businessData['website'] ?? '';
          _existingLogoUrl = businessData['logo_image_url'];
          mobileController.text = businessData['mobile'] ?? '';
          userNameController.text = businessData['user_name'] ?? '';
          _businessRole = businessData['user_type'] ?? 'owner';

          // Handle GST data
          if (businessData['gst'] != null) {
            final gst = businessData['gst'];
            _gstNumber = gst['gst_no'] ?? '';
            _gstController.text = _gstNumber;
            _gstFileType = gst['gst_file_type'];
            // Note: gst_file_url would be used for existing file display
          }
        });

        // Update location provider with existing address
        final locationProvider = Provider.of<LocationProvider>(context, listen: false);
        if (businessData['address'] != null) {
          // Note: This assumes address is a simple string. Adjust if it's more complex
          // For now, just set the address without coordinates
          locationProvider.setAddressOnly(businessData['address']);
        }
      }
    } catch (e) {
      print('Error loading existing business data: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final storeDataProvider = Provider.of<StoreDataProvider>(context);
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text("Create Business Account"),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      backgroundColor: Colors.white,
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 24),
              _buildBusinessLogoPicker(),
              const SizedBox(height: 16),
              _buildBusinessNameField(),
              const SizedBox(height: 16),
              _buildDescriptionField(),
              const SizedBox(height: 16),
              _buildStoreTimingsField(storeDataProvider),
              const SizedBox(height: 16),
              _buildTextField('Website', Icons.web),
              const SizedBox(height: 16),
              _buildGstNumberField(),
              const SizedBox(height: 16),
              _buildLocationButton(context),
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),
              _buildBusinessRoleSection(),
              const SizedBox(height: 16),
              _buildTextField('Name*', Icons.person, validator: (value) {
                if (value!.isEmpty) return 'Name is required';
                return null;
              }),
              const SizedBox(height: 16),
              _buildMobileNumberField(),
              const SizedBox(height: 32),
              _buildCreateAccountButton(storeDataProvider),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMobileNumberField() {
    return TextFormField(
      controller: mobileController,
      keyboardType: TextInputType.number,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        LengthLimitingTextInputFormatter(10),
      ],
      decoration: InputDecoration(
        labelText: 'Mobile number*',
        prefixIcon: const Icon(Icons.phone),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      validator: (value) {
        if (value!.isEmpty) return 'Mobile number is required';
        if (value.length != 10) return 'Mobile number must be 10 digits';
        return null;
      },
    );
  }

  Widget _buildBusinessLogoPicker() {
    return InkWell(
      onTap: () async {
        FilePickerResult? result = await FilePicker.platform.pickFiles(
          type: FileType.image,
          allowMultiple: false,
        );

        if (result != null && result.files.single.path != null) {
          setState(() {
            _attachedImagePath = result.files.single.path!;
          });
        }
      },
      child: Stack(
        alignment: Alignment.center,
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: Colors.grey[300],
            backgroundImage: _attachedImagePath != null
                ? FileImage(File(_attachedImagePath!))
                : (_existingLogoUrl != null && _existingLogoUrl!.isNotEmpty)
                    ? NetworkImage(_existingLogoUrl!) as ImageProvider
                    : null,
          ),
          Positioned(
            bottom: 8,
            right: 140,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(1),
                shape: BoxShape.circle,
              ),
              child: const Padding(
                padding: EdgeInsets.all(8.0),
                child: Icon(Icons.camera_alt_outlined,
                    size: 20, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<String> uploadImage(File imageFile) async {
    // TODO: Implement image upload to backend
    // For now, return a placeholder URL
    print("Uploading image: ${imageFile.path}");
    return 'https://example.com/placeholder-image.jpg';
  }



  Widget _buildBusinessNameField() {
    return TextFormField(
      controller: _businessNameController,
      maxLength: 50,
      maxLines: null, // This allows multiple lines
      decoration: InputDecoration(
        labelText: 'Business Name*',
        prefixIcon: const Icon(Icons.business),
        suffixIcon: Padding(
          padding: const EdgeInsets.only(top: 16.0),
          child: Text(
            '${_businessNameController.text.length}/50',
            style: const TextStyle(color: Colors.grey),
          ),
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        counterText: '',
      ),
      validator: (value) {
        if (value!.isEmpty) return 'Business Name is required';
        return null;
      },
      onChanged: (value) {
        setState(() {});
      },
    );
  }

  Widget _buildDescriptionField() {
    return TextFormField(
      controller: _descriptionController,
      maxLength: 300,
      maxLines: 3,
      decoration: InputDecoration(
        labelText: 'Description of the business*',
        prefixIcon: const Icon(Icons.description),
        suffixIcon: Align(
          widthFactor: 1.0,
          heightFactor: 1.0,
          child: Padding(
            padding: const EdgeInsets.only(top: 16.0, right: 8.0),
            child: Text(
              '${_descriptionController.text.length}/300',
              style: const TextStyle(color: Colors.grey),
            ),
          ),
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        counterText: '',
      ),
      validator: (value) {
        if (value!.isEmpty) return 'Description is required';
        return null;
      },
      onChanged: (value) {
        setState(() {});
      },
    );
  }

  Widget _buildTextField(String labelText, IconData icon,
      {FormFieldValidator<String>? validator}) {
    if (labelText == 'Website') {
      return TextFormField(
        controller: _displayWebsiteController, // Use display controller instead
        decoration: InputDecoration(
          labelText: labelText,
          prefixIcon: Icon(icon),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          helperText: 'Optional. Example: www.example.com',
        ),
        validator: _validateWebsite,
        onChanged: (value) {
          if (value.isNotEmpty) {
            // Store the actual value with https:// internally
            _actualWebsiteValue =
                !value.startsWith('http://') && !value.startsWith('https://')
                    ? 'https://$value'
                    : value;

            // Update the actual website controller
            websiteController.text = _actualWebsiteValue;
          } else {
            _actualWebsiteValue = '';
            websiteController.text = '';
          }
        },
      );
    }

    // Rest of the original code for other fields remains the same
    return TextFormField(
      controller: labelText == 'Mobile number*'
          ? mobileController
          : labelText == 'Name*'
              ? userNameController
              : null,
      decoration: InputDecoration(
        labelText: labelText,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      validator: validator,
    );
  }

  Widget _buildGstNumberField() {
    return TextFormField(
      readOnly: true,
      controller: _gstController,
      decoration: InputDecoration(
        labelText: 'GST Details', // Added asterisk to indicate required field
        prefixIcon: const Icon(Icons.receipt),
        suffixIcon: const Icon(Icons.arrow_forward),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      onTap: () async {
        String? existingGstUrl;
        if (widget.docId != null) {
          existingGstUrl = await _getExistingGstFileUrl();
        }
        if (!mounted) return;

        final result = await Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) => GstEntryScreen(
                    initialGstNumber: _gstNumber,
                    initialGstFileType: _gstFileType,
                    initialGstFilePath: _gstFilePath,
                    existingGstFileUrl: existingGstUrl,
                  )),
        );

        if (result != null) {
          setState(() {
            _gstNumber = result['gstNumber'] ?? '';
            _gstController.text =
                result['gstNumber'] ?? ''; // Update the controller text
            if (!result['keepExistingFile']) {
              _gstFilePath = result['gstFilePath'];
              _gstFileType = result['gstFileType'];
            }
          });
        }
      },
    );
  }

  Widget _buildLocationButton(BuildContext context) {
    return FormField<String>(
      validator: (value) {
        final locationProvider =
            Provider.of<LocationProvider>(context, listen: false);
        if (locationProvider.address == null ||
            locationProvider.address!.isEmpty) {
          return 'Business address is required';
        }
        return null;
      },
      builder: (FormFieldState<String> state) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Consumer<LocationProvider>(
              builder: (context, locationProvider, child) {
                return GestureDetector(
                  onTap: () => _openMapsScreen(context, locationProvider),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12.0),
                      color: Colors.grey[300],
                      border: state.hasError
                          ? Border.all(color: Colors.red, width: 1.0)
                          : null,
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        ClipRRect(
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(12.0),
                            topRight: Radius.circular(12.0),
                          ),
                          child: Stack(
                            children: [
                              Image.asset(
                                'assets/images/maps.png',
                                width: double.infinity,
                                height: 150.0,
                                fit: BoxFit.cover,
                              ),
                              Positioned.fill(
                                child: BackdropFilter(
                                  filter: ImageFilter.blur(
                                      sigmaX: 2.5, sigmaY: 2.5),
                                  child: Container(
                                    color: Colors.black.withOpacity(0),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          decoration: const BoxDecoration(
                            color: Colors.transparent,
                            borderRadius: BorderRadius.only(
                              bottomLeft: Radius.circular(12.0),
                              bottomRight: Radius.circular(12.0),
                            ),
                          ),
                          padding: const EdgeInsets.symmetric(
                              vertical: 16, horizontal: 24),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.location_on,
                                  size: 24.0, color: Colors.black),
                              const SizedBox(width: 8),
                              Flexible(
                                child: Text(
                                  locationProvider.address ??
                                      'Pin Business Location',
                                  overflow: TextOverflow.ellipsis,
                                  maxLines: 1,
                                  style: const TextStyle(
                                      fontSize: 16.0, color: Colors.black),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            if (state.hasError)
              Padding(
                padding: const EdgeInsets.only(left: 12, top: 8),
                child: Text(
                  state.errorText!,
                  style: const TextStyle(
                    color: Colors.red,
                    fontSize: 12,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Future<void> _openMapsScreen(
      BuildContext context, LocationProvider locationProvider) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const OpenStreetMapPage()),
    );
    if (result != null &&
        result['location'] != null &&
        result['address'] != null) {
      locationProvider.setLocation(
          result['location'] as LatLng, result['address'] as String);
    }
  }

  Widget _buildBusinessRoleSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Are you the owner/manager of this business?*',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        _buildRadioButton('I\'m the Business owner', 'Owner'),
        _buildRadioButton('I\'m the Incharge/Manager', 'Manager'),
        _buildRadioButton('I\'m an Employee', 'Employee'),
      ],
    );
  }

  Widget _buildRadioButton(String title, String value) {
    return RadioListTile(
      title: Text(title),
      value: value,
      groupValue: _businessRole,
      activeColor: Colors.black,
      onChanged: (value) {
        setState(() {
          _businessRole = value.toString();
        });
      },
    );
  }

  Widget _buildStoreTimingsField(StoreDataProvider storeDataProvider) {
    return GestureDetector(
      onTap: () async {
        final result = await Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const StoreTimingsScreen()),
        );
        if (result != null) {
          setState(() {
            _storeTimings = storeDataProvider.getFormattedStoreTimes();
          });
        }
      },
      child: AbsorbPointer(
        child: TextFormField(
          readOnly: true,
          decoration: InputDecoration(
            labelText: 'Store Timings*',
            hintText: _storeTimings.isEmpty ? 'Tap to set store timings' : null,
            prefixIcon: const Icon(Icons.access_time),
            suffixIcon: const Icon(Icons.arrow_forward),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          controller: TextEditingController(text: _storeTimings),
          validator: (value) {
            if (storeDataProvider.storeData.availability == 'Pick days' &&
                storeDataProvider.storeData.storeTimes.isEmpty) {
              return 'Store Timings are required';
            }
            return null;
          },
        ),
      ),
    );
  }



  Widget _buildCreateAccountButton(StoreDataProvider storeDataProvider) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Visibility(
            visible: !_isLoading,
            child: ElevatedButton(
              onPressed: () async {
                if (!_formKey.currentState!.validate()) {
                  // Show snackbar for any validation failure
                  showTopSnackBar(
                      context, 'Please fill all required fields correctly');
                  return;
                }

                setState(() {
                  _isLoading = true;
                });

                try {
                  // Get providers
                  final authProvider = Provider.of<auth_provider.AppAuthProvider>(context, listen: false);
                  final locationProvider = Provider.of<LocationProvider>(context, listen: false);

                  // Prepare GST data
                  String? gstFileUrl;
                  if (_gstFilePath != null && _gstFilePath!.isNotEmpty) {
                    gstFileUrl = await uploadFile(File(_gstFilePath!), 'gst');
                  } else if (widget.docId != null) {
                    gstFileUrl = await _getExistingGstFileUrl();
                  }

                  // Prepare logo data
                  String? logoImageUrl;
                  if (_attachedImagePath != null && _attachedImagePath!.isNotEmpty) {
                    logoImageUrl = await uploadImage(File(_attachedImagePath!));
                  } else if (_existingLogoUrl != null) {
                    logoImageUrl = _existingLogoUrl;
                  }

                  // Prepare business data
                  final businessData = {
                    'storeverified': false,
                    'category': '', // This should come from business category selection
                    'name': _businessNameController.text,
                    'description': _descriptionController.text,
                    'email': _userEmail ?? '',
                    'website': websiteController.text,
                    'gst': {
                      'gst_file_url': gstFileUrl ?? '',
                      'gst_file_type': _gstFileType ?? (widget.docId != null ? await _getExistingGstFileType() : ''),
                      'gst_no': _gstNumber,
                    },
                    'logo_image_url': logoImageUrl ?? '',
                    'mobile': mobileController.text,
                    'address': locationProvider.address ?? '',
                    'user_type': _businessRole,
                    'user_name': userNameController.text,
                    'uid': _userEmail ?? '', // Using email as UID for now
                  };

                  // Call the addBusiness API
                  final result = await authProvider.addBusiness(businessData);

                  if (result['success'] == true) {
                    showTopSnackBar(context, 'Account created successfully');
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => EmailVerification(email: _userEmail ?? ''),
                      ),
                    );
                  } else {
                    final errorMessage = result['error'] ?? 'Failed to create account';
                    print('Business creation failed: $errorMessage');
                    print('Business data sent: $businessData');
                    showTopSnackBar(context, errorMessage);
                  }
                } catch (error) {
                  print('Error creating business account: $error');
                  showTopSnackBar(context, 'An error occurred. Please try again.');
                } finally {
                  setState(() {
                    _isLoading = false;
                  });
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
              ),
              child: Text(
                widget.docId != null ? 'UPDATE ACCOUNT' : 'CREATE ACCOUNT',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          if (_isLoading)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: double.infinity,
                height: 50,
                color: Colors.black,
                child: const Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 3,
                        ),
                      ),
                      SizedBox(width: 12),
                      Text(
                        'Please wait...',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Future<String?> _getExistingGstFileUrl() async {
    // TODO: Implement GraphQL query to get existing GST file URL
    return null;
  }

  Future<String?> _getExistingGstFileType() async {
    // TODO: Implement GraphQL query to get existing GST file type
    return null;
  }

  Future<String> uploadFile(File file, String folderName) async {
    // TODO: Implement file upload to backend
    // For now, return a placeholder URL
    print("Uploading file: ${file.path} to $folderName");
    return 'https://example.com/placeholder-file.jpg';
  }

  @override
  void dispose() {
    _displayWebsiteController.dispose();
    // ... other existing disposals ...
    super.dispose();
  }
}

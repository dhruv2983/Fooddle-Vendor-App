import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  Modal,
  Text,
  Dimensions,
  Pressable,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAMERA_HEIGHT = SCREEN_HEIGHT * 0.42;
const FRAME_SIZE = 230;
const CORNER_SIZE = 36;
const CORNER_THICKNESS = 3;

interface ScanTabButtonProps {
  onPress?: () => void;
  accessibilityState?: { selected?: boolean };
  children?: React.ReactNode;
}

const ScanTabButton: React.FC<ScanTabButtonProps> = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const scanned = useRef(false);

  const handlePress = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    scanned.current = false;
    setShowScanner(true);
  };

  const handleClose = () => {
    setShowScanner(false);
    scanned.current = false;
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned.current) return;
    scanned.current = true;
    setShowScanner(false);
    router.push(`/(main)/(tabs)/order-details?orderId=${data.trim()}`);
  };

  return (
    <>
      {/* Tab bar button */}
      <View style={styles.wrapper}>
        <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.85}>
          <Ionicons name="qr-code-outline" size={32} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showScanner}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        {/* Backdrop — tap outside to close */}
        <Pressable style={styles.backdrop} onPress={handleClose}>

          {/* Outer wrapper — extra padding so popped buttons don't get clipped by backdrop touch area */}
          <View style={styles.floatZone}>

            {/* Camera card */}
            <View style={styles.cameraBox}>
              {permission?.granted ? (
                <>
                  <CameraView
                    style={{ width: '100%', height: '100%' }}
                    facing={facing}
                    onBarcodeScanned={handleBarcodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  />

                  {/* Overlay with cutout */}
                  <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <View style={styles.overlayTop} />
                    <View style={styles.overlayRow}>
                      <View style={styles.overlaySide} />
                      <View style={styles.frame}>
                        {/* Ghost border */}
                        <View style={styles.frameBorder} />
                        {/* Corners */}
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />
                      </View>
                      <View style={styles.overlaySide} />
                    </View>
                    <View style={styles.overlayBottom} />
                  </View>

                  <Text style={styles.hint}>Align QR code within the frame</Text>

                  {/* Flip — naked icon inside modal bottom */}
                  <TouchableOpacity
                    style={styles.flipBtn}
                    onPress={() => setFacing(f => (f === 'back' ? 'front' : 'back'))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera-reverse" size={28} color="rgba(255,255,255,0.85)" />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.permissionDenied}>
                  <Ionicons name="camera-off-outline" size={48} color="#888" />
                  <Text style={styles.permissionTitle}>Camera Access Required</Text>
                  <Text style={styles.permissionSub}>
                    Enable camera permission in Settings to scan QR codes.
                  </Text>
                </View>
              )}
            </View>

            {/* X — pops out top-right corner */}
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.85}>
              <Ionicons name="close" size={18} color="#E53935" />
            </TouchableOpacity>


          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const floatButton = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#fff',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 6,
    },
    android: { elevation: 6 },
  }),
};

const styles = StyleSheet.create({
  // ── Tab bar button ─────────────────────────────────────
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },

  // ── Backdrop ───────────────────────────────────────────
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Float zone — gives room for the X button to pop out ─
  floatZone: {
    width: '80%',
    position: 'relative',
    paddingTop: 20,
  },

  // ── Camera card ────────────────────────────────────────
  cameraBox: {
    width: '100%',
    height: CAMERA_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#111',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: { elevation: 14 },
    }),
  },

  // ── Overlay ────────────────────────────────────────────
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  overlayRow: { flexDirection: 'row', height: FRAME_SIZE },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },

  // ── Scan frame ─────────────────────────────────────────
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  frameBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#fff',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 5 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 5 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 5 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 5 },

  hint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // ── Permission denied ──────────────────────────────────
  permissionDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
    backgroundColor: '#1a1a1a',
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  permissionSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 19,
  },

  // ── Floating X — top-right ─────────────────────────────
  closeBtn: {
    ...floatButton,
    position: 'absolute',
    top: 0,
    right: -20,
  },

  // ── Flip — naked icon pinned inside camera bottom-centre ─
  flipBtn: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default ScanTabButton;

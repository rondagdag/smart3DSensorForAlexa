from __future__ import print_function
from sys import platform
from os import system
import WalabotAPI as wlbt
import socket, sys

if __name__ == '__main__':
	wlbt.Init()  # load the WalabotSDK to the Python wrapper	
	wlbt.SetSettingsFolder()  # set the path to the essetial database files
	wlbt.ConnectAny()  # establishes communication with the Walabot
	wlbt.SetProfile(wlbt.PROF_SENSOR)  # set scan profile out of the possibilities
	wlbt.SetThreshold(35)
	wlbt.SetArenaR(50,400,4)
	wlbt.SetArenaPhi(-45,45,2)
	wlbt.SetArenaTheta(-20,20,10)
	
	wlbt.SetDynamicImageFilter(wlbt.FILTER_TYPE_MTI)  # specify filter to use
	
	wlbt.Start()  # starts Walabot in preparation for scanning
	system('cls' if platform == 'win32' else 'clear')  # clear the terminal
	numOfTargetsToDisplay = 1
	if len(sys.argv) == 2:
		TCP_IP = '127.0.0.1'
		TCP_PORT = int(sys.argv[1])

		s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		s.bind((TCP_IP, TCP_PORT))
		s.listen(1)
		conn, addr = s.accept()			
		while True:
			wlbt.Trigger()  # initiates a scan and records signals
			targets = wlbt.GetSensorTargets()  # provides a list of identified targets
			finds = '{"targets": ['
			index = 0
			for i, t in enumerate(targets):
				if i < numOfTargetsToDisplay:
					index += 1
					print('Target {}\nx = {}\ny = {}\nz = {}\n'.format(i+1, t.xPosCm, t.yPosCm, t.zPosCm))
					finds += '{"x": "%s", "y": "%s", "z": "%s"}' % (t.xPosCm, t.yPosCm, t.zPosCm)
					#if index < len(targets):
					#	finds += ','												
			finds += ']}'
			my_str = 'TARGETS%s' % finds
			conn.sendall(str.encode(my_str))			
		conn.close()
		wlbt.Stop()  # stops Walabot when finished scanning
		wlbt.Disconnect()  # stops communication with Walabot

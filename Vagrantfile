# -*- mode: ruby -*-
# vi: set ft=ruby :

$script = <<-SCRIPT
echo "==> Grab elasticsearch key"
wget -qO - https://packages.elasticsearch.org/GPG-KEY-elasticsearch | sudo apt-key add -

echo "==> Add elasticsearch repository"
sudo add-apt-repository -y "deb http://packages.elasticsearch.org/elasticsearch/1.4/debian stable main"

echo "==> Installing dependencies"
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs build-essential openjdk-7-jdk htop

echo "==> Grab dstore .deb"
wget https://github.com/trappsnl/dstore/raw/master/build/debinstall/dstore-1.deb

echo "Installing deb"
sudo dpkg -i dstore-1.deb

echo "==> Running apt-get -f install"
sudo apt-get -f -y install << INPUT
dstore
dstore
INPUT

echo "==> Starting elasticsearch on startup"
sudo service elasticsearch start
sudo update-rc.d elasticsearch defaults 95 10

echo "==> Starting dstore on startup"
sudo update-rc.d dstore defaults 96 11

echo "==> Updating dstore config"
mkdir /home/vagrant/{blueprint,level}
sudo sed -i 's|PROJECTOR_PATH=/opt/dstore|PROJECTOR_PATH=/vagrant|g' /etc/dstore/dstore.conf
sudo sed -i 's|LEVEL_PATH="$PROJECTOR_PATH/storage/level"|LEVEL_PATH="/home/vagrant/level"|g' /etc/dstore/dstore.conf
sudo sed -i 's|PROJECT_FILE_PATH="$PROJECTOR_PATH/storage/blueprint"|PROJECTOR_PATH="/home/vagrant/blueprint"|g' /etc/dstore/dstore.conf

echo "==> Start dstore"
sudo service dstore start
SCRIPT

Vagrant.configure("2") do |config|
  config.vm.define 'dstore' do |machine|
    machine.vm.box = "ubuntu/trusty64"
    machine.vm.hostname = "dstore"
    machine.vm.box_url = 'https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box'

    machine.vm.network "private_network", ip: "192.168.33.123"

    machine.vm.provision :shell, inline: $script

    machine.vm.synced_folder "../dstore/", "/vagrant", type: "nfs"

    machine.vm.provider "virtualbox" do |vb|
      vb.name = "dstore"
      vb.customize ["modifyvm", :id, "--memory", "1500"]
    end
  end
end
